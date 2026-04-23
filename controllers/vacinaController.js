import Vacinas from '../models/Vacinas.js';
import Estoque from '../models/Estoque.js';
import { capitalizarNome } from '../utils/formatarNome.js';

export const listarVacinas = async (req, res) => {
    try {
        const vacinas = await Vacinas.findAll();
        res.json(vacinas);
    } catch (error) {
        console.error('Erro ao listar vacinas: ', error);
        res.status(500).json({ error: "Erro ao listar vacinas", details: error.message });
    }
}

export const listarVacinaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const vacina = await Vacinas.findByPk(id);
        if (!vacina) {
            return res.status(404).json({ error: 'Vacina não encontrada' });
        }
        res.json(vacina);
    } catch (error) {
        console.error('Erro ao listar vacina por ID: ', error);
        res.status(500).json({ error: "Erro ao listar vacina por ID", details: error.message });
    }
}

export const criarVacina = async (req, res) => {
    const t = await Vacinas.sequelize.transaction();

    try {
        const { nome, fabricante, validade, postoId } = req.body;

        if (!nome || !fabricante || !validade || !postoId) {
            await t.rollback(); // Cancelamos se faltar dados
            return res.status(400).json({ error: 'Todos os campos são obrigatórios, incluindo o postoId' });
        }

        const nomeFormatado = typeof capitalizarNome === 'function' ? capitalizarNome(nome) : nome;
        const fabricanteFormatado = typeof capitalizarNome === 'function' ? capitalizarNome(fabricante) : fabricante;

        const vacinaExistente = await Vacinas.findOne({ where: { nome: nomeFormatado } });
        if (vacinaExistente) {
            await t.rollback();
            return res.status(400).json({ error: 'Já existe uma vacina com esse nome' });
        }

        const novaVacina = await Vacinas.create({
            nome: nomeFormatado,
            fabricante: fabricanteFormatado,
            validade
        }, { transaction: t });

        await Estoque.create({
            postoId,
            vacinaId: novaVacina.id,
            quantidade: 10
        }, { transaction: t });
        await t.commit();

        const vacinaData = novaVacina.toJSON();
        const dataApenas = new Date(vacinaData.validade).toISOString().split('T')[0];

        console.log('Vacina criada: ', novaVacina.id);

        return res.status(201).json({
            message: 'Vacina criada e estoque atualizado com sucesso',
            vacina: {
                ...vacinaData,
                validade: dataApenas
            }
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error('Erro ao criar vacina: ', error);
        return res.status(500).json({
            error: "Erro interno ao criar vacina",
            details: error.message
        });
    }
}

export const atualizarVacina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, fabricante, validade } = req.body;

        const vacina = await Vacinas.findByPk(id);
        if (!vacina) {
            return res.status(404).json({ error: 'Vacina não encontrada' });
        }

        await vacina.update({
            nome: nome || vacina.nome,
            fabricante: fabricante || vacina.fabricante,
            validade: validade || vacina.validade
        });

        res.json({ message: 'Vacina atualizada com sucesso' })
    } catch (error) {
        console.error('Erro ao atualizar vacina: ', error);
        res.status(500).json({ error: "Erro ao atualizar vacina", details: error.message });
    }
}

export const excluirVacina = async (req, res) => {
    try {
        const { id } = req.params;
        const vacina = await Vacinas.findByPk(id);
        if (!vacina) {
            return res.status(404).json({ error: 'Vacina não encontrada' });
        }

        await vacina.destroy();
        res.json({ message: 'Vacina excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir vacina: ', error);
        res.status(500).json({ error: "Erro ao excluir vacina", details: error.message });
    }
}