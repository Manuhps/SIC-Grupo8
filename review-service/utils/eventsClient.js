const axios = require('axios');

// URL base do Events Service
const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL || 'http://events-service:3003';

const eventsClient = {
    /**
     * Buscar um evento por ID
     * @param {number} eventoId - ID do evento
     * @returns {Promise<Object>} Dados do evento
     * @throws {Error} Se evento não for encontrado ou serviço estiver indisponível
     */
    async getEventoById(eventoId) {
        try {
            const response = await axios.get(
                `${EVENTS_SERVICE_URL}/events/${eventoId}`,
                {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw {
                    status: 404,
                    message: "Evento não encontrado",
                    details: `Não existe nenhum evento com o ID ${eventoId}`
                };
            }
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                throw {
                    status: 503,
                    message: "Serviço de eventos indisponível",
                    details: "Não foi possível comunicar com o serviço de eventos. Tente novamente mais tarde."
                };
            }
            
            throw {
                status: error.response?.status || 500,
                message: "Erro ao buscar evento",
                details: error.message
            };
        }
    }
};

module.exports = eventsClient;
