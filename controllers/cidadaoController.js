import Cidadao from '../models/Cidadaos.js';
import { capitalizarNome } from '../utils/formatarNome.js';
import { Op } from 'sequelize';

function cpfEhValido(cpf) {
    return /^\d{11}$/.test(cpf);
}

function telefoneEhValido(telefone) {
    return /^\d{11}$/.test(telefone);
}

function emailEhValido(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function limparCpf(cpf) {
    return cpf.replace(/\D/g, '');
}

// Listar todos os cidadãos
export const listarCidadaos = async (req, res) => {
    try {
        const cidadaos = await Cidadao.findAll();
        res.status(200).json(cidadaos);
    } catch (error) {
        console.error('Erro ao listar cidadãos:', error.message);
        res.status(500).json({ error: 'Erro ao listar cidadãos', details: error.message });
    }
};

// Buscar cidadão por ID
export const listarCidadaoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const cidadao = await Cidadao.findByPk(id);

        if (!cidadao) {
            return res.status(404).json({ error: 'Cidadão não encontrado' });
        }

        res.status(200).json(cidadao);
    } catch (error) {
        console.error('Erro ao buscar cidadão:', error.message);
        res.status(500).json({ error: 'Erro ao buscar cidadão', details: error.message });
    }
};

// Criar cidadão
export const criarCidadao = async (req, res) => {
    try {
        let { nome, cpf, telefone, email, endereco } = req.body;

        nome = capitalizarNome(nome);
        cpf = limparCpf(cpf);
        telefone = telefone.replace(/\D/g, '');

        // Validações
        if (!cpfEhValido(cpf)) {
            return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
        }
        if (!telefoneEhValido(telefone)) {
            return res.status(400).json({ error: 'Telefone inválido. Deve conter 11 dígitos numéricos.' });
        }
        if (!emailEhValido(email)) {
            return res.status(400).json({ error: 'Email inválido. Verifique o formato (ex: nome@exemplo.com).' });
        }

        // Verificar duplicidade
        const cpfExistente = await Cidadao.findOne({ where: { cpf } });
        if (cpfExistente) {
            return res.status(409).json({ error: 'CPF já cadastrado.' });
        }

        const telefoneExistente = await Cidadao.findOne({ where: { telefone } });
        if (telefoneExistente) {
            return res.status(409).json({ error: 'Telefone já cadastrado. Por favor, utilize outro número.' });
        }

        // Criar cidadão
        const novoCidadao = await Cidadao.create({
            nome,
            cpf,
            telefone,
            email,
            endereco
        });

        console.log(`Cidadão ${nome} cadastrado com sucesso com ID ${novoCidadao.id}`);
        res.status(201).json({ message: 'Cidadão adicionado com sucesso', id: novoCidadao.id });

    } catch (error) {
        console.error('Erro ao adicionar cidadão:', error.message);
        res.status(500).json({ error: 'Erro ao adicionar cidadão', details: error.message });
    }
};

// Atualizar cidadão
export const atualizarCidadao = async (req, res) => {
    try {
        const { id } = req.params;
        let { nome, cpf, telefone, email, endereco } = req.body;

        const cidadao = await Cidadao.findByPk(id);
        if (!cidadao) {
            return res.status(404).json({ error: 'Cidadão não encontrado' });
        }

        if (nome) nome = capitalizarNome(nome);

        if (cpf) {
            cpf = limparCpf(cpf);
            if (!cpfEhValido(cpf)) {
                return res.status(400).json({ error: 'CPF inválido. Deve conter exatamente 11 dígitos numéricos.' });
            }

            const cpfExistente = await Cidadao.findOne({ 
                where: { cpf, id: { [Op.ne]: id } } 
            });
            if (cpfExistente) {
                return res.status(409).json({ error: 'Novo CPF já cadastrado em outro cidadão.' });
            }
        }

        if (telefone) {
            telefone = telefone.replace(/\D/g, '');
            if (!telefoneEhValido(telefone)) {
                return res.status(400).json({ error: 'Telefone inválido. Deve conter exatamente 11 dígitos numéricos.' });
            }

            const telExistente = await Cidadao.findOne({ 
                where: { telefone, id: { [Op.ne]: id } } 
            });
            if (telExistente) {
                return res.status(409).json({ error: 'Novo Telefone já cadastrado em outro cidadão.' });
            }
        }

        if (email && !emailEhValido(email)) {
            return res.status(400).json({ error: 'Novo Email inválido. Verifique o formato.' });
        }

        // Atualizar apenas os campos fornecidos
        await cidadao.update({
            ...(nome && { nome }),
            ...(cpf && { cpf }),
            ...(telefone && { telefone }),
            ...(email && { email }),
            ...(endereco && { endereco })
        });

        res.json({ message: 'Cidadão atualizado com sucesso' });

    } catch (error) {
        console.error('Erro ao atualizar cidadão:', error.message);
        res.status(400).json({ error: 'Erro ao atualizar cidadão', details: error.message });
    }
};

// Excluir cidadão
export const excluirCidadao = async (req, res) => {
    try {
        const { id } = req.params;

        const cidadao = await Cidadao.findByPk(id);
        if (!cidadao) {
            return res.status(404).json({ error: 'Cidadão não encontrado' });
        }

        await cidadao.destroy();
        res.json({ message: 'Cidadão excluído com sucesso' });

    } catch (error) {
        console.error('Erro ao excluir cidadão:', error.message);
        res.status(500).json({ 
            error: 'Erro ao excluir cidadão. Verifique se há agendamentos pendentes.', 
            details: error.message 
        });
    }
};