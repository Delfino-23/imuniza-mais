import Vacinas from '../models/Vacinas.js';

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
    try {
        const { nome, descricao } = req.body;
        if (!nome || !descricao) {
            return res.status(400).json({ error: 'Nome e descrição não podem ser vazios' });
        }

        const vacinaExistente = await Vacinas.findOne({ where: { nome } });
        if (vacinaExistente) {
            return res.status(400).json({ error: 'Já existe uma vacina com esse nome' });
        }

        const novaVacina = await Vacinas.create({ nome, descricao });
        console.log('Vacina criada: ', novaVacina);
        res.status(201).json({ message: 'Vacina criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar vacina: ', error);
        res.status(500).json({
            error: "Erro ao criar vacina",
            details: error.message
        });
    }
}

export const atualizarVacina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        const vacina = await Vacinas.findByPk(id);
        if (!vacina) {
            return res.status(404).json({ error: 'Vacina não encontrada' });
        }

        await vacina.update({
            nome: nome || vacina.nome,
            descricao: descricao || vacina.descricao
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