import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

export class CarrinhoBuilder {
  constructor() {
    // Valores padrão: usuário comum + 1 item de R$ 200
    this._user  = UserMother.umUsuarioPadrao();
    this._itens = [new Item('Produto Padrão', 200)];
  }

  comUser(user) {
    this._user = user;
    return this; // permite encadeamento
  }

  comItens(itens) {
    this._itens = itens;
    return this;
  }

  vazio() {
    this._itens = [];
    return this;
  }

  build() {
    const carrinho = new Carrinho(this._user, this._itens);
    return carrinho;
  }
}