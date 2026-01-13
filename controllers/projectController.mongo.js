const Project = require('../models/projectModel.mongo');
const Submission = require('../models/submissionModel.mongo');
const User = require('../models/userModel.mongo');

const projectController = {
  // Listar projetos, podendo filtrar por participação do user
  async listProjects(req, res) {
    const user = req.user;
    const mine = req.query.mine === 'true';
    // Filtro: projetos em que o user é autor ou supervisor
    let filter = {};
    if (mine) {
      filter = { $or: [ { author: user._id }, { supervisor: user._id } ] };
    }
    // Buscar projetos com autor e supervisor populados
    const projects = await Project.find(filter)
      .populate('author', 'name')
      .populate('supervisor', 'name')
      .lean();
    // Buscar submissões agrupadas por projeto
    const submissions = await Submission.aggregate([
      { $group: {
        _id: '$project',
        total: { $sum: 1 },
        last: { $max: '$submittedAt' }
      }}
    ]);
    // Mapear submissões por id de projeto
    const subMap = {};
    submissions.forEach(s => {
      subMap[s._id.toString()] = { total: s.total, last: s.last };
    });
    // Montar resposta
    const result = projects.map(p => {
      const sub = subMap[p._id.toString()] || {};
      return {
        id: p._id,
        title: p.title,
        author: p.author?.name,
        supervisor: p.supervisor?.name,
        status: p.status,
        grade: p.grade,
        deadline: p.deadline,
        maxAttempts: p.maxAttempts,
        totalSubmissions: sub.total || 0,
        lastSubmission: sub.last || null,
        _links: [
          { rel: 'self', method: 'GET', href: `/projects/${p._id}` },
          { rel: 'delete', method: 'DELETE', href: `/projects/${p._id}` }
        ]
      };
    });
    res.json(result);
  },
  async deleteProject(req, res) {
    const user = req.user;
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }
    // Só o autor pode apagar
    if (project.author.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Apenas o autor pode apagar este projeto.' });
    }
    // Só se não tiver sido avaliado
    if (project.status === 'graded') {
      return res.status(400).json({ error: 'Não é possível apagar um projeto já avaliado.' });
    }
    // Apagar submissões associadas
    await Submission.deleteMany({ project: project._id });
    // Apagar o projeto
    await Project.deleteOne({ _id: project._id });
    res.json({
      message: 'Projeto apagado com sucesso.',
      _links: [
        { rel: 'list', method: 'GET', href: '/projects' }
      ]
    });
  }
};

module.exports = projectController; 