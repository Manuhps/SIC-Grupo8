const Alojamento = require('../models/alojamentoModel');

const alojamentoService = {
    // Criar um novo alojamento
    create: async (data, userId) => {
        const { nome, descricao, precoBase, zona, tipo, imagem } = data;

        // Validações
        if (!nome || !descricao || !precoBase || !zona || !tipo) {
            throw { 
                status: 400, 
                message: "Campos obrigatórios: nome, descricao, precoBase, zona, tipo" 
            };
        }

        const alojamento = await Alojamento.create({
            nome,
            descricao,
            precoBase,
            zona,
            tipo,
            imagem: imagem || null,
            proprietario_id: userId
        });

        return alojamento;
    },

    // Listar todos os alojamentos
    getAll: async (filters, pagination) => {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const alojamentos = await Alojamento.findAndCountAll({
            limit: +limit,
            offset: +offset,
            order: [['created_at', 'DESC']]
        });

        return {
            total: alojamentos.count,
            totalPages: Math.ceil(alojamentos.count / limit),
            currentPage: +page,
            data: alojamentos.rows
        };
    },

    // Obter um alojamento específico
    getById: async (id) => {
        const alojamento = await Alojamento.findByPk(id);

        if (!alojamento) {
            throw { 
                status: 404, 
                message: "Alojamento não encontrado" 
            };
        }

        return alojamento;
    },

    // Atualizar parcialmente um alojamento
    update: async (id, data, userId) => {
        const alojamento = await Alojamento.findByPk(id);
        
        if (!alojamento) {
            throw { 
                status: 404, 
                message: "Alojamento não encontrado" 
            };
        }

        // Verificar se é o proprietário
        if (alojamento.proprietario_id !== userId) {
            throw { 
                status: 403, 
                message: "Não autorizado. Apenas o proprietário pode editar este alojamento." 
            };
        }

        // Validação: se algum campo obrigatório for enviado, todos devem estar preenchidos
        const camposObrigatorios = ['nome', 'descricao', 'precoBase', 'zona', 'tipo', 'imagem'];
        if (camposObrigatorios.some(campo => data[campo] !== undefined)) {
            for (const campo of camposObrigatorios) {
                if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
                    throw { 
                        status: 400, 
                        message: `O campo '${campo}' não pode estar vazio` 
                    };
                }
            }
            if (isNaN(Number(data.precoBase))) {
                throw { 
                    status: 400, 
                    message: "O campo 'precoBase' deve ser um número" 
                };
            }
        }

        // Atualiza apenas os campos enviados
        const camposPermitidos = ['nome', 'descricao', 'precoBase', 'zona', 'tipo', 'imagem'];
        const camposParaAtualizar = {};
        
        camposPermitidos.forEach(campo => {
            if (data[campo] !== undefined) {
                camposParaAtualizar[campo] = data[campo];
            }
        });

        await alojamento.update(camposParaAtualizar);
        return alojamento;
    },

    // Excluir um alojamento
    delete: async (id, userId) => {
        const alojamento = await Alojamento.findByPk(id);
        
        if (!alojamento) {
            throw { 
                status: 404, 
                message: "Alojamento não encontrado" 
            };
        }

        // Verificar se é o proprietário
        if (alojamento.proprietario_id !== userId) {
            throw { 
                status: 403, 
                message: "Não autorizado. Apenas o proprietário pode eliminar este alojamento." 
            };
        }

        await alojamento.destroy();
        return { message: "Alojamento apagado com sucesso" };
    }
};

module.exports = alojamentoService;
