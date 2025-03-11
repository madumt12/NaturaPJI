const Banco = require("../model/Banco");

module.exports = class VendaDAO {

    async gravar(venda) {
        try {
            Banco.init();  // Inicializa a conexão com o banco de dados

            // Inicia a transação
            await Banco.conexao.query('BEGIN');

            // Inserir a venda principal na tabela "venda"
            const res = await Banco.conexao.query(
                `INSERT INTO venda (codcli, total, datav) 
                VALUES ($1, $2, $3) 
                RETURNING codigo`, 
                [venda.id_cliente, venda.total, venda.data]
            );
            
            const vendaId = res.rows[0].codigo;  // Recupera o ID da venda inserida

            // Inserir os itens da venda na tabela "item"
            for (let item of venda.itens) {
                await Banco.conexao.query(
                    `INSERT INTO item (qtde, precounit, codproduto, codvenda) 
                    VALUES ($1, $2, $3, $4)`,
                    [item.quantidade, item.preco, item.id_produto, vendaId]
                );
            }

            // Commit da transação
            await Banco.conexao.query('COMMIT');
            
            return vendaId;  // Retorna o ID da venda criada
        } catch (erro) {
            // Caso ocorra algum erro, realiza o rollback da transação
            await Banco.conexao.query('ROLLBACK');
            console.log("Erro ao gravar venda: " + erro);
            throw erro;
        } finally {
            Banco.conexao.end();  // Encerra a conexão com o banco
        }
    }
}
