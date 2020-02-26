import React, { Component, Fragment } from "react";
import Api from "../services/Api";
import InputCustomizado from "./InputCustomizado";
import ButtonCustomizado from "./ButtonCustomizado";
import PubSub from "pubsub-js";
import TratadorErros from "../TratadorErros";

class FormularioAutor extends Component {
	constructor() {
		super();
		this.state = {
			nome: "",
			email: "",
			senha: ""
		};
		// dizendo para o react qual é o this que deve usar
		this.enviaForm = this.enviaForm.bind(this);
		// this.setNome = this.setNome.bind(this);
		// this.setEmail = this.setEmail.bind(this);
		// this.setSenha = this.setSenha.bind(this);
	}

	enviaForm(evento) {
		evento.preventDefault();

		Api.post("/autores", { nome: this.state.nome, email: this.state.email, senha: this.state.senha }).then((novaListagem) => {
			// disparar aviso geral de novaListagem disponível
			PubSub.publish("atualiza-lista-autores", novaListagem.data);
			this.setState({
				nome: "",
				email: "",
				senha: ""
			});
		});
		// 	.catch((novaListagem) => {
		// 		if (novaListagem.response.status === 400) {
		// 			new TratadorErros().publicaErros(novaListagem.response);
		// 		}
		// 	});
		// Api.interceptors.request.use(() => {
		// 	PubSub.publish("limpa-erros", {});
		// });
	}

	salvaAlteracao(InputCustomizado, evento) {
		var campoSendoAlterado = {};
		campoSendoAlterado[InputCustomizado] = evento.target.value;
		this.setState(campoSendoAlterado);
	}
	// setNome(evento) {
	// 	this.setState({ nome: evento.target.value });
	// }
	// setEmail(evento) {
	// 	this.setState({ email: evento.target.value });
	// }
	// setSenha(evento) {
	// 	this.setState({ senha: evento.target.value });
	// }

	render() {
		return (
			<div className="pure-form pure-form-aligned">
				<form className="pure-form pure-form-aligned" onSubmit={this.enviaForm}>
					<InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvaAlteracao.bind(this, "nome")} label="Nome" />
					<InputCustomizado id="email" type="email" name="email" value={this.state.email} onChange={this.salvaAlteracao.bind(this, "email")} label="Email" />
					<InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} onChange={this.salvaAlteracao.bind(this, "senha")} label="Senha" />
					<ButtonCustomizado type="submit" value="Gravar" className="pure-button pure-button-primary"></ButtonCustomizado>
				</form>
			</div>
		);
	}
}

class TabelaAutores extends Component {
	render() {
		return (
			<div>
				<table className="pure-table">
					<thead>
						<tr>
							<th>Nome</th>
							<th>email</th>
						</tr>
					</thead>
					<tbody>
						{this.props.lista.map((autor) => {
							return (
								<tr key={autor.id}>
									<td>{autor.nome}</td>
									<td>{autor.email}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}

export default class AutorBox extends Component {
	constructor() {
		super();
		this.state = {
			lista: []
		};
	}

	componentDidMount() {
		Api.get("/autores")
			.then((resposta) => {
				this.setState({ lista: resposta.data });
			})
			.catch((error) => {
				console.log(error);
			});

		PubSub.subscribe("atualiza-lista-autores", (topico, novaLista) => {
			this.setState({ lista: novaLista });
		});
	}

	render() {
		return (
			<Fragment>
				<div className="header">
					<h1>Cadastro de autores</h1>
				</div>
				<div className="content" id="content">
					<FormularioAutor />
					<TabelaAutores lista={this.state.lista} />
				</div>
			</Fragment>
		);
	}
}
