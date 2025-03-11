// ItemDAO.js
const Banco = require("../model/Banco");
const Item = require("./Item");

module.exports = class ItemDAO {
    // Método para gravar um item no banco de dados
    async gravar(item) {
        try {
            Banco.init();
            const res = await Banco.conexao.query(
                'INSERT INTO item (qtde, precounit, codproduto, codvenda) VALUES ($1, $2, $3, $4) RETURNING codigo',
                [item.qtde, item.precounit, item.codproduto, item.codvenda]
            );
            Banco.conexao.end();
            return res.rows[0].codigo; // Retorna o código do item inserido
        } catch (erro) {
            console.error("Erro ao gravar item no banco de dados:", erro);
        }
    }

    // Método para buscar todos os itens associados a uma venda específica
    async buscarPorVenda(codVenda) {
        try {
            Banco.init();
            const res = await Banco.conexao.query(
                'SELECT * FROM item WHERE codvenda = $1',
                [codVenda]
            );
            Banco.conexao.end();

            // Mapeia os resultados para objetos Item
            const itens = res.rows.map(row => {
                let item = new Item();
                item.codigo = row.codigo;
                item.qtde = row.qtde;
                item.precounit = row.precounit;
                item.codproduto = row.codproduto;
                item.codvenda = row.codvenda;
                return item;
            });
            
            return itens; // Retorna a lista de itens
        } catch (erro) {
            console.error("Erro ao buscar itens por venda:", erro);
        }
    }

    // Método para deletar todos os itens de uma venda, se necessário
    async deletarPorVenda(codVenda) {
        try {
            Banco.init();
            await Banco.conexao.query(
                'DELETE FROM item WHERE codvenda = $1',
                [codVenda]
            );
            Banco.conexao.end();
            console.log(`Itens da venda ${codVenda} deletados com sucesso.`);
        } catch (erro) {
            console.error("Erro ao deletar itens da venda:", erro);
        }
    }
};
