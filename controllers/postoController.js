import PostosSaude from "../models/PostosSaude";

export const listarPostos = async (req, res) => {
    try {
        const postos = await PostosSaude.findAll();
        res.json(postos);
    } catch (error) {
        console.error('Erro ao listar postos de saúde: ', error);
        res.status(500).json({ error: "Erro ao listar postos de saúde", details: error.message });
    }
}

export const listarPostoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const posto = await PostosSaude.findByPk(id);
        if (!posto) {
            return res.status(404).json({ error: 'Posto de saúde não encontrado' });
        }
        res.json(posto);
    } catch (error) {
        console.error('Erro ao listar posto de saúde por ID: ', error);
        res.status(500).json({ error: "Erro ao listar posto de saúde por ID", details: error.message });
    }
}

export const criarPosto = async (req, res) => {
    try {
        const { nome, endereco } = req.body;
        if (!nome || !endereco) {
            return res.status(400).json({ error: 'Nome e endereço não podem ser vazios' });
        }

        const postoExistente = await PostosSaude.findOne({ where: { nome } });
        if (postoExistente) {
            return res.status(400).json({ error: 'Já existe um posto de saúde com esse nome' });
        }

        const novoPosto = await PostosSaude.create({ nome, endereco });
        console.log('Posto de saúde criado: ', novoPosto);
        res.status(201).json({ message: 'Posto de saúde criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar posto de saúde: ', error);
        res.status(500).json({
            error: "Erro ao criar posto de saúde",
            details: error.message
        });
    }
}

export const atualizarPosto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, endereco } = req.body;

        const posto = await PostosSaude.findByPk(id);
        if (!posto) {
            return res.status(404).json({ error: 'Posto de saúde não encontrado' });
        }

        await posto.update({
            nome: nome || posto.nome,
            endereco: endereco || posto.endereco
        });

        res.json({ message: 'Posto de saúde atualizado com sucesso' })
    } catch (error) {
        console.error('Erro ao atualizar posto de saúde: ', error);
        res.status(500).json({ error: "Erro ao atualizar posto de saúde", details: error.message });
    }
}

export const excluirPosto = async (req, res) => {
    try {
        const { id } = req.params;
        const posto = await PostosSaude.findByPk(id);
        if (!posto) {
            return res.status(404).json({ error: 'Posto de saúde não encontrado' });
        }

        await posto.destroy();
        res.json({ message: 'Posto de saúde excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir posto de saúde: ', error);
        res.status(500).json({ error: "Erro ao excluir posto de saúde", details: error.message });
    }
}