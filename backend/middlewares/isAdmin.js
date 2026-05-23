function isAdmin(req, res, next) {
    if (!req.session.usuarioID) {
        return res.status(401).json({ erro: 'Não logado' });
    }

    if (!req.session.isAdmin && !req.usuario?.isAdmin) {
        return res.status(403).json({ erro: 'Acesso negado' });
    }

    next();
}

module.exports = isAdmin;