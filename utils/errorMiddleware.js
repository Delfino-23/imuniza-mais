import { dbError, mapDbError, logDatabaseError } from '../utils/dbErrors.js';

/**
 * Middleware de erro - DEVE ser o ÚLTIMO middleware registrado
 * 
 * @param {Error} err - Objeto de erro
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Próximo middleware
 */
export const errorMiddleware = (err, req, res, next) => {
    const requestId = req.id || `req_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // ============================================================
    // 1. ERROS DE BANCO DE DADOS (Sequelize/SQLite)
    // ============================================================

    if (err.name?.includes('Sequelize') || err.original?.code?.includes('SQLITE')) {
        const dbError = mapDbError(err);

        // Log estruturado
        logDatabaseError(err, {
            requestId,
            method: req.method,
            path: req.path,
            timestamp,
        });

        return res.status(dbError.statusCode).json({
            error: dbError.userMessage,
            code: dbError.errorCode,
            requestId, // Ajuda o usuário reportar o erro
            timestamp,
        });
    }

    // ============================================================
    // 2. ERROS CUSTOMIZADOS (DatabaseError)
    // ============================================================

    if (err instanceof dbError) {
        console.error(`[${err.statusCode}] ${err.errorCode}`, {
            requestId,
            internal: err.internalMessage,
            timestamp,
        });

        return res.status(err.statusCode).json({
            error: err.userMessage,
            code: err.errorCode,
            requestId,
            timestamp,
        });
    }

    // ============================================================
    // 3. ERROS DE VALIDAÇÃO (JOI, ZOD, etc)
    // ============================================================

    if (err.name === 'ValidationError' || err.isJoi) {
        const messages = err.details?.map(d => d.message).join('; ') ||
            (err.errors?.map(e => e.message).join('; ')) ||
            err.message;

        console.warn(`[400] VALIDATION_ERROR`, {
            requestId,
            message: messages,
            timestamp,
        });

        return res.status(400).json({
            error: 'Dados fornecidos são inválidos',
            details: messages,
            requestId,
            timestamp,
        });
    }

    // ============================================================
    // 4. ERROS DE REQUISIÇÃO HTTP
    // ============================================================

    if (err.status && err.status >= 400 && err.status < 500) {
        console.warn(`[${err.status}] ${err.name}`, {
            requestId,
            message: err.message,
            timestamp,
        });

        return res.status(err.status).json({
            error: err.message || 'Requisição inválida',
            requestId,
            timestamp,
        });
    }

    // ============================================================
    // 5. ERROS NÃO CAPTURADOS (500)
    // ============================================================

    console.error(`[500] UNCAUGHT_ERROR`, {
        requestId,
        name: err.name,
        message: err.message,
        stack: err.stack,
        timestamp,
    });

    // Não exponha detalhes do erro em produção
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(500).json({
        error: isProduction
            ? 'Algo deu errado. Nossa equipe foi notificada.'
            : `Erro: ${err.message}`,
        code: 'INTERNAL_SERVER_ERROR',
        requestId,
        timestamp,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Middleware para adicionar um ID único a cada requisição
 * Útil para tracking de erros
 */
export const requestIdMiddleware = (req, res, next) => {
    req.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.id);
    next();
};

/**
 * Middleware para tratar rotas não encontradas (404)
 */
export const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        error: `Rota não encontrada: ${req.method} ${req.path}`,
        code: 'NOT_FOUND',
        requestId: req.id,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Wrapper para converter funções async em expressão segura
 * Evita try/catch repetido em cada rota
 * 
 * @param {Function} fn - Função async do controller
 * @returns {Function} - Middleware que captura erros
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};