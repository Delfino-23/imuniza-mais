import Agendamento from "../models/Agendamentos.js";
import Estoque from "../models/Estoque.js";
import Cidadao from "../models/Cidadaos.js";
import Vacina from "../models/Vacinas.js";
import PostoSaude from "../models/PostosSaude.js";
import Status from "../models/Status.js";
import HistoricoVacinal from "../models/HistoricoVacinal.js";
import sequelize from "../config/database.js";

const STATUS_AGENDADO_ID = 1;
const STATUS_REALIZADO_ID = 2;
const STATUS_CANCELADO_ID = 3;
const ID_POSTO_ESTOQUE_CENTRAL = 1;

// Listar agendamentos
export const listarAgendamentos = async (req, res) => {
    try {
        const agendamentos = await Agendamento.findAll({
            attributes: ['id', 'dataHora'],
            include: [
                { model: Cidadao, attributes: ['nome', 'cpf', 'endereco'] },
                { model: Vacina, attributes: ['nome', 'fabricante'] },
                { model: PostoSaude, attributes: ['nome', 'endereco'] },
                { model: Status, attributes: ['descricao'] }
            ]
        });

        const dataFormatada = agendamentos.map(item => ({
            id: item.id,
            cidadaoNome: item.cidadao?.nome,
            cidadaoCPF: item.cidadao?.cpf,
            cidadaoEndereco: item.cidadao?.endereco,
            vacinaNome: item.vacina?.nome,
            vacinaFabricante: item.vacina?.fabricante,
            postoNome: item.postos_saude?.nome,
            postoEndereco: item.postos_saude?.endereco,
            statusDescricao: item.status?.descricao,
            dataHora: item.dataHora
        }));

        res.status(200).json(dataFormatada);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error.message);
        res.status(500).json({ error: 'Erro interno', details: error.message });
    }
}

// Criar agendamento
export const criarAgendamento = async (req, res) => {
    try {
        const { cidadaoId, vacinaId, postoId, dataHora } = req.body;
        const statusId = req.body.statusId || STATUS_AGENDADO_ID;

        if (!cidadaoId || !vacinaId || !postoId || !dataHora) {
            return res.status(400).json({ error: 'Dados obrigatórios ausentes (cidadaoId, vacinaId, postoId, dataHora).' });
        }

        const existingAppointment = await Agendamento.findOne({
            where: {
                cidadaoId,
                vacinaId
            }
        });

        if (existingAppointment) {
            return res.status(409).json({
                error: `Este cidadão já possui um agendamento para esta vacina com status '${existingAppointment.descricao}'.`,
                details: 'Um novo agendamento só é permitido se o anterior estiver Realizado ou Cancelado.'
            });
        }

        const info = await Agendamento.create({
            cidadaoId,
            vacinaId,
            postoId,
            statusId,
            dataHora
        });

        res.status(201).json({ message: 'Agendamento criado com sucesso', id: info.id });

    } catch (error) {
        console.error('Erro ao criar agendamento:', error.message);
        res.status(400).json({ error: 'Erro ao criar agendamento', details: error.message });
    }
}

const tratarErro = (error, res) => {
    const status = error.message.includes('Estoque insuficiente') ? 409 :
        error.message.includes('Agendamento não encontrado') ? 404 :
            500;

    console.error('Erro ao processar atualização de agendamento:', error.message);

    res.status(status).json({
        error: error.message,
        details: error.message
    });
};

const processingRequests = new Set();

// Atualizar agendamento
export const atualizarAgendamento = async (req, res) => {
    const { id } = req.params;
    const newStatusId = parseInt(req.body.statusId);

    console.log("inicio da atualização")
    console.log("ID do agendamento:", id);
    console.log("Novo status ID:", newStatusId);

    if (isNaN(newStatusId)) {
        return res.status(400).json({ error: "Status ID inválido." });
    }

    // Previnir requisições duplicadas
    const requestKey = `${id}-${newStatusId}`;
    if (processingRequests.has(requestKey)) {
        return res.status(409).json({ error: "Requisição já está sendo processada. Por favor, aguarde." });
    }
    let transaction; // CORRIGIDO: adicionado let

    try {
        transaction = await sequelize.transaction();
        console.log("Transação iniciada")

        const currentAppointment = await Agendamento.findByPk(id, {
            attributes: ['id', 'vacinaId', 'postoId', 'cidadaoId', 'statusId'],
            transaction
        });

        console.log("Agendamento encontrado: ", currentAppointment?.dataValues);

        console.log("Current Appointment:", currentAppointment);
        console.log('Current Appointment raw:', currentAppointment?.dataValues);

        if (!currentAppointment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Agendamento não encontrado.' });
        }

        const oldStatusId = currentAppointment.statusId;
        const isBecomingRealizado = newStatusId === STATUS_REALIZADO_ID && oldStatusId !== STATUS_REALIZADO_ID;
        const isNoLongerRealizado = oldStatusId === STATUS_REALIZADO_ID && newStatusId !== STATUS_REALIZADO_ID;

        console.log('Status antigo:', oldStatusId);
        console.log('Está virando realizado?', isBecomingRealizado);
        console.log('Está deixando de ser realizado?', isNoLongerRealizado);

        console.log('=== ANTES DO UPDATE ===');
        await currentAppointment.update(
            { statusId: newStatusId },
            { transaction }
        );
        console.log('=== DEPOIS DO UPDATE ===');

        // Se mudou para "Realizado"
        if (isBecomingRealizado) {
            console.log('=== INICIANDO PROCESSAR REALIZAÇÃO ===');
            await processarRealizacao(id, currentAppointment, transaction); // CORRIGIDO: adicionado transaction
            console.log('=== FIM PROCESSAR REALIZAÇÃO ===');
        }

        // Se deixou de ser "Realizado"
        if (isNoLongerRealizado) {
            console.log('=== INICIANDO REVERTER REALIZAÇÃO ===');
            await reverterRealizacao(id, currentAppointment, transaction); // CORRIGIDO: adicionado transaction
            console.log('=== FIM REVERTER REALIZAÇÃO ===');
        }

        console.log('=== ANTES DO COMMIT ===');
        await transaction.commit();
        console.log('=== DEPOIS DO COMMIT ===');

        res.status(200).json({
            message: "Agendamento atualizado com sucesso.",
            id: id,
            novoStatus: newStatusId
        });

    } catch (error) {
        console.log('=== ERRO CAPTURADO ===');
        console.log('Mensagem do erro:', error.message);
        console.log('Stack do erro:', error.stack);
        if (transaction) {
            await transaction.rollback();
        }
        tratarErro(error, res);
    } finally {
        processingRequests.delete(requestKey);
    }
};

// Função auxiliar: processar realização de vacina
const processarRealizacao = async (agendamentoId, appointment, transaction) => {
    console.log('[processarRealizacao] Início');
    console.log('[processarRealizacao] agendamentoId:', agendamentoId);
    console.log('[processarRealizacao] appointment.dataValues:', appointment.dataValues);

    const { vacinaId, cidadaoId } = appointment;
    const postoEstoqueId = ID_POSTO_ESTOQUE_CENTRAL;

    console.log('[processarRealizacao] Buscando estoque...');
    const estoqueItem = await Estoque.findOne({
        where: {
            postoId: postoEstoqueId,
            vacinaId: vacinaId
        },
        transaction
    });
    console.log('[processarRealizacao] Estoque encontrado:', estoqueItem?.dataValues);

    if (!estoqueItem || estoqueItem.quantidade <= 0) {
        throw new Error('Estoque insuficiente ou item não encontrado no estoque central.');
    }

    console.log('[processarRealizacao] Decrementando estoque...');
    await estoqueItem.decrement('quantidade', { by: 1, transaction });
    console.log('[processarRealizacao] Estoque decrementado');

    console.log('[processarRealizacao] Criando histórico vacinal...');
    await HistoricoVacinal.create({
        cidadaoId: cidadaoId,
        vacinaId: vacinaId,
        dataAplicacao: new Date(),
        agendamentoId: agendamentoId
    }, { transaction });
    console.log('[processarRealizacao] Histórico criado');
};

const reverterRealizacao = async (agendamentoId, appointment, transaction) => {
    console.log('[reverterRealizacao] Início');
    console.log('[reverterRealizacao] agendamentoId:', agendamentoId);

    const { vacinaId } = appointment;
    const postoEstoqueId = ID_POSTO_ESTOQUE_CENTRAL;

    console.log('[reverterRealizacao] Buscando estoque...');
    const estoqueItem = await Estoque.findOne({
        where: {
            postoId: postoEstoqueId,
            vacinaId: vacinaId
        },
        transaction
    });
    console.log('[reverterRealizacao] Estoque encontrado:', estoqueItem?.dataValues);

    if (estoqueItem) {
        console.log('[reverterRealizacao] Incrementando estoque...');
        await estoqueItem.increment('quantidade', { by: 1, transaction });
        console.log('[reverterRealizacao] Estoque incrementado');
    }

    console.log('[reverterRealizacao] Removendo do histórico...');
    await HistoricoVacinal.destroy({
        where: {
            agendamentoId: agendamentoId
        },
        transaction
    });
    console.log('[reverterRealizacao] Histórico removido');
};

// Excluir agendamento
export const excluirAgendamento = async (req, res) => {
    const { id } = req.params;

    console.log("Iniciando exclusão de agendamento");
    console.log("ID do agendamento:", id);

    // Previnir requisições duplicadas
    const requestKey = `${id}-${Agendamento.name}-delete`;
    if (processingRequests.has(requestKey)) {
        return res.status(409).json({ error: "Requisição já está sendo processada. Por favor, aguarde." });
    }
    let transaction;

    try {
        transaction = await sequelize.transaction();
        console.log("Transação iniciada para exclusão");

        const agendamento = await Agendamento.findByPk(id, {
            attributes: ['id', 'cidadaoId', 'vacinaId', 'postoId', 'statusId'],
            transaction
        });

        console.log("Agendamento encontrado: ", agendamento?.dataValues);

        if (!agendamento) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        console.log("=== ANTES DA EXCLUSÃO ===");
        await agendamento.destroy({ transaction });
        console.log("=== DEPOIS DA EXCLUSÃO ===");

        console.log("=== ANTES DO COMMIT ===");
        await transaction.commit();
        console.log("=== DEPOIS DO COMMIT ===");

        res.status(200).json({
            message: 'Agendamento excluído com sucesso',
            id: id
        });
    } catch (error) {
        console.log("=== ERRO CAPTURADO NA EXCLUSÃO ===");
        console.log("Mensagem do erro:", error.message);
        console.log("Stack do erro:", error.stack);
        if (transaction) {
            await transaction.rollback();
        }
        tratarErro(error, res)
    } finally {
        processingRequests.delete(requestKey);
    }
}