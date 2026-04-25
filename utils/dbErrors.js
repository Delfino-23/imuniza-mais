// Mapeamento de erros do SQLite para mensagens de usuário
export class dbError extends Error {
    constructor(userMessage, statusCode = 500, internalMessage = null, errorCode = null) {
        super(userMessage);
        this.name = 'dbError';
        this.userMessage = userMessage;
        this.statusCode = statusCode;
        this.internalMessage = internalMessage;
        this.errorCode = errorCode;
        this.timestamp = new Date();
    }

    toJSON() {
        return {
            error: this.userMessage,
            code: this.errorCode,
            timestamp: this.timestamp,
        };
    }
}

// Mapeia erros do SQLite para formato padrão
export function mapDbError(error) {
    // Extrai o código de erro
    const errorCode = error.orginal?.code || error.code || error.name;
    const errorMessage = error.original?.message || error.message || '';
    const errorDetails = error.original?.datail || '';

    console.error('Database Error: ', {
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
        orginalError: error.original
    });

    // Erros de constraint (violações de integridade)
    if (errorCode === 'SQLITE_CONSTRAINT' || errorMessage.includes('UNIQUE constraint failed')) {
        if (errorMessage.includes('nome')) {
            return new dbError(
                'Já existe um registro com esse nome.',
                400,
                `UNIQUE constraint failed: ${errorMessage}`,
                'UNIQUE_VIOLATION'
            );
        }
        if (errorMessage.includes('email')) {
            return new dbError(
                'Este email já está registrado no sistema.',
                400,
                `UNIQUE constraint failed: ${errorMessage}`,
                'UNIQUE_VIOLATION'
            );
        }
        if (errorMessage.includes('cpf')) {
            return new dbError(
                'Este CPF já está registrado no sistema.',
                400,
                `UNIQUE constraint failed: ${errorMessage}`,
                'UNIQUE_VIOLATION'
            );
        }
        // Fallback genérico para UNIQUE
        return new dbError(
            'Estes dados já estão registrados no sistema. Tente outros valores.',
            400,
            `UNIQUE constraint failed: ${errorMessage}`,
            'UNIQUE_VIOLATION'
        );
    }

    // Erros de foreign key (referências inválidas)
    if (errorCode === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
        errorMessage.includes('FOREIGN KEY constraint failed')) {

        if (errorMessage.includes('postoId') || errorMessage.includes('Posto')) {
            return new dbError(
                'O posto selecionado não existe. Verifique o ID e tente novamente.',
                409,
                `FK constraint failed: Posto não encontrado - ${errorMessage}`,
                'FOREIGN_KEY_VIOLATION'
            );
        }
        if (errorMessage.includes('vacinaId') || errorMessage.includes('Vacina')) {
            return new dbError(
                'A vacina selecionada não existe. Verifique o ID e tente novamente.',
                409,
                `FK constraint failed: Vacina não encontrada - ${errorMessage}`,
                'FOREIGN_KEY_VIOLATION'
            );
        }
        if (errorMessage.includes('usuarioId') || errorMessage.includes('Usuario')) {
            return new dbError(
                'O usuário selecionado não existe. Verifique o ID e tente novamente.',
                409,
                `FK constraint failed: Usuário não encontrado - ${errorMessage}`,
                'FOREIGN_KEY_VIOLATION'
            );
        }
        // Fallback genérico para FK
        return new dbError(
            'Um dos valores referenciados não existe no sistema. Verifique os dados e tente novamente.',
            409,
            `FK constraint failed: ${errorMessage}`,
            'FOREIGN_KEY_VIOLATION'
        );
    }

    // ============================================================
    // ERROS DE CHECK CONSTRAINT
    // ============================================================

    if (errorCode === 'SQLITE_CONSTRAINT_CHECK' ||
        errorMessage.includes('CHECK constraint failed')) {

        if (errorMessage.includes('quantidade')) {
            return new dbError(
                'A quantidade não pode ser negativa.',
                400,
                `CHECK constraint failed: quantidade deve ser >= 0 - ${errorMessage}`,
                'CHECK_CONSTRAINT_VIOLATION'
            );
        }
        if (errorMessage.includes('validade')) {
            return new dbError(
                'A data de validade deve ser futura.',
                400,
                `CHECK constraint failed: validade inválida - ${errorMessage}`,
                'CHECK_CONSTRAINT_VIOLATION'
            );
        }
        // Fallback genérico para CHECK
        return new dbError(
            'Os dados fornecidos não atendem aos critérios de validação.',
            400,
            `CHECK constraint failed: ${errorMessage}`,
            'CHECK_CONSTRAINT_VIOLATION'
        );
    }

    // ============================================================
    // ERROS DE NOT NULL
    // ============================================================

    if (errorCode === 'SQLITE_CONSTRAINT_NOTNULL' ||
        errorMessage.includes('NOT NULL constraint failed')) {

        if (errorMessage.includes('nome')) {
            return new dbError(
                'O nome é obrigatório e não pode estar vazio.',
                400,
                `NOT NULL constraint failed: nome - ${errorMessage}`,
                'NOT_NULL_VIOLATION'
            );
        }
        if (errorMessage.includes('fabricante')) {
            return new dbError(
                'O fabricante é obrigatório e não pode estar vazio.',
                400,
                `NOT NULL constraint failed: fabricante - ${errorMessage}`,
                'NOT_NULL_VIOLATION'
            );
        }
        if (errorMessage.includes('validade')) {
            return new dbError(
                'A data de validade é obrigatória.',
                400,
                `NOT NULL constraint failed: validade - ${errorMessage}`,
                'NOT_NULL_VIOLATION'
            );
        }
        // Fallback genérico para NOT NULL
        return new dbError(
            'Há campos obrigatórios não preenchidos. Verifique todos os campos.',
            400,
            `NOT NULL constraint failed: ${errorMessage}`,
            'NOT_NULL_VIOLATION'
        );
    }

    // ============================================================
    // ERROS DE CONEXÃO
    // ============================================================

    if (errorCode === 'ECONNREFUSED' ||
        errorMessage.includes('connection refused')) {
        return new dbError(
            'Não foi possível conectar ao banco de dados. Tente novamente em alguns momentos.',
            503,
            `Database connection refused: ${errorMessage}`,
            'CONNECTION_REFUSED'
        );
    }

    if (errorCode === 'ETIMEDOUT' ||
        errorCode === 'EHOSTUNREACH' ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('timed out')) {
        return new dbError(
            'A operação demorou muito tempo. O sistema pode estar indisponível. Tente novamente.',
            503,
            `Database timeout: ${errorMessage}`,
            'TIMEOUT'
        );
    }

    if (errorCode === 'ENOENT' ||
        errorMessage.includes('no such file')) {
        return new dbError(
            'Arquivo de banco de dados não encontrado. Contate o administrador.',
            500,
            `Database file not found: ${errorMessage}`,
            'DATABASE_NOT_FOUND'
        );
    }

    // ============================================================
    // ERROS DE DISK/PERMISSÃO
    // ============================================================

    if (errorCode === 'SQLITE_READONLY' ||
        errorCode === 'EACCES' ||
        errorMessage.includes('readonly') ||
        errorMessage.includes('permission denied')) {
        return new dbError(
            'Não foi possível escrever no banco de dados. O servidor pode estar sem permissão ou sem espaço.',
            503,
            `Database readonly or permission denied: ${errorMessage}`,
            'READONLY_OR_PERMISSION_ERROR'
        );
    }

    if (errorCode === 'SQLITE_FULL' ||
        errorMessage.includes('disk I/O error') ||
        errorMessage.includes('out of disk space')) {
        return new dbError(
            'Espaço em disco insuficiente. Contate o administrador do sistema.',
            503,
            `Database disk full: ${errorMessage}`,
            'DISK_FULL'
        );
    }

    // ============================================================
    // ERROS DE SYNTAX/ESTRUTURA
    // ============================================================

    if (errorCode === 'SQLITE_ERROR' &&
        (errorMessage.includes('syntax error') || errorMessage.includes('no such table'))) {

        if (errorMessage.includes('no such table')) {
            return new dbError(
                'Uma tabela do banco de dados está faltando. Contate o administrador.',
                500,
                `Database table missing: ${errorMessage}`,
                'TABLE_NOT_FOUND'
            );
        }

        return new dbError(
            'Erro na estrutura do banco de dados. Contate o administrador.',
            500,
            `Database syntax error: ${errorMessage}`,
            'SYNTAX_ERROR'
        );
    }

    // ============================================================
    // ERROS DO SEQUELIZE
    // ============================================================

    // ValidationError do Sequelize (validação de schema)
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join('; ');
        return new dbError(
            `Dados inválidos: ${messages}`,
            400,
            `Sequelize validation error: ${messages}`,
            'VALIDATION_ERROR'
        );
    }

    // DatabaseError do Sequelize
    if (error.name === 'SequelizeDatabaseError') {
        // Tenta extrair informação mais específica
        return new dbError(
            'Erro ao processar sua solicitação. Tente novamente em alguns momentos.',
            500,
            `Sequelize database error: ${errorMessage}`,
            'DATABASE_ERROR'
        );
    }

    // ============================================================
    // ERRO DESCONHECIDO/FALLBACK
    // ============================================================

    console.error('❌ Unhandled database error:', error);

    return new dbError(
        'Algo inesperado aconteceu. Nossa equipe foi notificada. Tente novamente mais tarde.',
        500,
        `Unhandled error: ${errorMessage}`,
        'UNKNOWN_ERROR'
    );
};

/**
 * Helper para logar erros de forma estruturada
 */
export const logDatabaseError = (error, context = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type: 'DATABASE_ERROR',
        error: {
            name: error.name,
            code: error.code,
            message: error.message,
            originalCode: error.original?.code,
            originalMessage: error.original?.message,
        },
        context,
    };

    // Em produção, você poderia enviar para um serviço de logs
    console.error('📋 LOG ENTRY:', JSON.stringify(logEntry, null, 2));

    return logEntry;
};

/**
 * Validações que podem ser feitas ANTES de ir ao banco
 * Evita erros de banco desnecessários
 */
export const validateBeforeDatabase = {
    /**
     * Valida se um campo é único antes de tentar salvar
     * Reduz constraint violations
     */
    async checkUnique(model, field, value) {
        try {
            const exists = await model.findOne({ where: { [field]: value } });
            if (exists) {
                throw new dbError(
                    `Já existe um registro com ${field} = "${value}"`,
                    400,
                    `Pre-check validation failed for unique ${field}`,
                    'UNIQUE_PRE_CHECK_FAILED'
                );
            }
        } catch (error) {
            if (error instanceof dbError) throw error;
            throw new dbError(
                'Erro ao validar dados.',
                500,
                `Pre-check validation error: ${error.message}`,
                'VALIDATION_ERROR'
            );
        }
    },

    /**
     * Valida se uma FK existe antes de tentar salvar
     */
    async checkForeignKey(model, foreignKeyId) {
        try {
            const exists = await model.findByPk(foreignKeyId);
            if (!exists) {
                throw new dbError(
                    `O registro com ID ${foreignKeyId} não foi encontrado`,
                    409,
                    `Pre-check validation failed for FK: ${model.name} with id ${foreignKeyId}`,
                    'FOREIGN_KEY_PRE_CHECK_FAILED'
                );
            }
        } catch (error) {
            if (error instanceof dbError) throw error;
            throw new dbError(
                'Erro ao validar referência.',
                500,
                `Pre-check validation error: ${error.message}`,
                'VALIDATION_ERROR'
            );
        }
    },

    /**
     * Valida data
     */
    validateDate(dateString, fieldName = 'data') {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new dbError(
                    `${fieldName} inválida. Use o formato YYYY-MM-DD`,
                    400,
                    `Invalid date format: ${dateString}`,
                    'INVALID_DATE'
                );
            }
            return date;
        } catch (error) {
            if (error instanceof dbError) throw error;
            throw new dbError(
                `${fieldName} inválida`,
                400,
                `Date validation error: ${error.message}`,
                'INVALID_DATE'
            );
        }
    },

    /**
     * Valida número positivo
     */
    validatePositiveNumber(value, fieldName = 'número') {
        if (value === null || value === undefined) {
            throw new dbError(
                `${fieldName} é obrigatório`,
                400,
                `Missing value for ${fieldName}`,
                'MISSING_VALUE'
            );
        }
        const num = Number(value);
        if (isNaN(num) || num < 0) {
            throw new dbError(
                `${fieldName} deve ser um número positivo`,
                400,
                `Invalid positive number: ${value}`,
                'INVALID_NUMBER'
            );
        }
        return num;
    },

    /**
     * Valida string não vazia
     */
    validateNonEmptyString(value, fieldName = 'campo') {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new dbError(
                `${fieldName} é obrigatório e não pode estar vazio`,
                400,
                `Empty string for ${fieldName}`,
                'EMPTY_STRING'
            );
        }
        return value.trim();
    }
}