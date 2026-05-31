// __tests__/CheckoutService.test.js
const CheckoutService = require('../src/services/CheckoutService');
const Item            = require('../src/domain/Item');
const UserMother      = require('./builders/UserMother');
const CarrinhoBuilder = require('./builders/CarrinhoBuilder');

// ─────────────────────────────────────────────────────────────
// CENÁRIO 1: Falha no pagamento (Etapa 4 — STUB)
// ─────────────────────────────────────────────────────────────
describe('quando o pagamento falha', () => {
  it('deve retornar null', async () => {
    // ARRANGE
    const carrinho = new CarrinhoBuilder().build();

    // GatewayPagamento como STUB: retorna { success: false }
    const gatewayStub = {
      cobrar: jest.fn().mockResolvedValue({ success: false })
    };

    // Dummies: não devem ser chamados neste cenário
    const repositoryDummy = { salvar: jest.fn() };
    const emailDummy      = { enviarEmail: jest.fn() };

    const service = new CheckoutService(
      gatewayStub,
      repositoryDummy,
      emailDummy
    );

    // ACT
    const pedido = await service.processarPedido(
      carrinho.user,
      carrinho
    );

    // ASSERT — verificação de ESTADO
    expect(pedido).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// CENÁRIO 2: Cliente Premium com desconto (Etapa 5 — MOCK)
// ─────────────────────────────────────────────────────────────
describe('quando um cliente Premium finaliza a compra', () => {
  it('deve aplicar desconto de 10% e enviar e-mail de confirmação', async () => {
    // ARRANGE
    const user  = UserMother.umUsuarioPremium();
    const itens = [new Item('p1', 'Notebook', 200)];
    const carrinho = new CarrinhoBuilder()
      .comUser(user)
      .comItens(itens)
      .build();

    // GatewayPagamento como STUB (controla retorno)
    const gatewayStub = {
      cobrar: jest.fn().mockResolvedValue({ success: true })
    };

    // PedidoRepository como STUB (retorna pedido salvo fictício)
    const repositoryStub = {
      salvar: jest.fn().mockResolvedValue({
        id: 'pedido-1',
        status: 'APROVADO'
      })
    };

    // EmailService como MOCK (verificaremos a chamada)
    const emailMock = {
      enviarEmail: jest.fn().mockResolvedValue(true)
    };

    const service = new CheckoutService(
      gatewayStub,
      repositoryStub,
      emailMock
    );

    // ACT
    const pedido = await service.processarPedido(user, carrinho);

    // ASSERT — verificação de COMPORTAMENTO
    // O gateway deve ter sido chamado com R$ 180 (200 - 10%)
    expect(gatewayStub.cobrar).toHaveBeenCalledWith(
      180,
      expect.anything()
    );

    // O e-mail deve ter sido enviado exatamente 1 vez,
    // para o endereço correto, com o assunto correto
    expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
    expect(emailMock.enviarEmail).toHaveBeenCalledWith(
      'premium@email.com',
      'Seu Pedido foi Aprovado!',
      expect.anything()
    );

    // O pedido não deve ser nulo
    expect(pedido).not.toBeNull();
  });
});