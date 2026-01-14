const axios = require('axios');

// URL base do Accommodation Service
// Em Docker: usar o nome do serviço (accommodation-service)
// Em desenvolvimento local: usar localhost
const ACCOMMODATION_SERVICE_URL = process.env.ACCOMMODATION_SERVICE_URL || 'http://accommodation-service:3002';

const accommodationClient = {
    /**
     * Buscar um alojamento por ID
     * @param {number} alojamentoId - ID do alojamento
     * @returns {Promise<Object>} Dados do alojamento
     * @throws {Error} Se alojamento não for encontrado ou serviço estiver indisponível
     */
    async getAlojamentoById(alojamentoId) {
        try {
            const response = await axios.get(
                `${ACCOMMODATION_SERVICE_URL}/accommodations/${alojamentoId}`,
                {
                    timeout: 5000, // 5 segundos de timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            // Se for erro 404, alojamento não existe
            if (error.response && error.response.status === 404) {
                throw {
                    status: 404,
                    message: "Alojamento não encontrado",
                    details: `Não existe nenhum alojamento com o ID ${alojamentoId}`
                };
            }
            
            // Se o serviço estiver indisponível
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                throw {
                    status: 503,
                    message: "Serviço de alojamentos indisponível",
                    details: "Não foi possível comunicar com o serviço de alojamentos. Tente novamente mais tarde."
                };
            }
            
            // Outros erros
            throw {
                status: error.response?.status || 500,
                message: "Erro ao buscar alojamento",
                details: error.message
            };
        }
    },

    /**
     * Verificar se um alojamento existe e retornar seus dados
     * @param {number} alojamentoId - ID do alojamento
     * @returns {Promise<Object>} Dados do alojamento
     */
    async verificarAlojamentoExiste(alojamentoId) {
        return await this.getAlojamentoById(alojamentoId);
    }
};

module.exports = accommodationClient;
