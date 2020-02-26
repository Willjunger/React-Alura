import React, { Component, Fragment } from "react";
import Api from "../services/Api";
import InputCustomizado from "./InputCustomizado";
import ButtonCustomizado from "./ButtonCustomizado";
import PubSub from "pubsub-js";
// import TratadorErros from "../TratadorErros";

export default class LivroBox extends Component {
	constructor() {
		super();
		this.state = {
			lista: [],
			autores: []
		};
	}
	componentDidMount() {
		Api.get("/livros")
			.then((resposta) => {
				this.setState({ lista: resposta.data });
			})
			.catch((error) => {
				console.log(error);
			});

		Api.get("/autores")
			.then((resposta) => {
				this.setState({ autores: resposta.data });
			})
			.catch((error) => {
				console.log(error);
			});

		PubSub.subscribe("atualiza-lista-livros", (topico, novaLista) => {
			this.setState({ lista: novaLista });
		});
	}
	render() {
		return (
			<Fragment>
				<div className="header">
					<h1>Cadastro de Livros</h1>
				</div>
				<div className="content" id="content">
					<FormularioLivro autores={this.state.autores} />
					<TabelaLivros lista={this.state.lista} />
				</div>
			</Fragment>
		);
	}
}

class TabelaLivros extends Component {
	render() {
		return (
			<div>
				<table className="pure-table">
					<thead>
						<tr>
							<th>Título</th>
							<th>Preço</th>
							<th>Autor</th>
						</tr>
					</thead>
					<tbody>
						{this.props.lista.map((livro) => {
							return (
								<tr key={livro.id}>
									<td>{livro.titulo}</td>
									<td>{livro.preco}</td>
									<td>{livro.autor.nome}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}

class FormularioLivro extends Component {
	constructor() {
		super();
		this.state = {
			titulo: "",
			preco: "",
			autorId: ""
		};
		// dizendo para o react qual é o this que deve usar
		this.enviaForm = this.enviaForm.bind(this);
		// this.setTitulo = this.setTitulo.bind(this);
		// this.setPreco = this.setPreco.bind(this);
		// this.setAutorId = this.setAutorId.bind(this);
	}

	enviaForm(evento) {
		evento.preventDefault();

		Api.post("/livros", { titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId }).then((novaListagem) => {
			// disparar aviso geral de novaListagem disponível
			PubSub.publish("atualiza-lista-livros", novaListagem.data);
			this.setState({
				titulo: "",
				preco: "",
				autorId: ""
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

	// setTitulo(evento) {
	// 	this.setState({ titulo: evento.target.value });
	// }
	// setPreco(evento) {
	// 	this.setState({ preco: evento.target.value });
	// }
	// setAutorId(evento) {
	// 	this.setState({ autorId: evento.target.value });
	// }

	render() {
		return (
			<div className="pure-form pure-form-aligned">
				<form className="pure-form pure-form-aligned" onSubmit={this.enviaForm}>
					<InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this, "titulo")} label="Titulo" />
					<InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.salvaAlteracao.bind(this, "preco")} label="Preço" />

					<div className="pure-control-group">
						<label htmlFor="autorId">Autor</label>
						<select value={this.state.autorId} id="autorId" name="autorId" onChange={this.salvaAlteracao.bind(this, "autorId")}>
							<option value="">Selecione autor</option>
							{this.props.autores.map((autor) => {
								return <option value={autor.id}>{autor.nome}</option>;
							})}
						</select>
					</div>

					<ButtonCustomizado type="submit" value="Gravar" className="pure-button pure-button-primary"></ButtonCustomizado>
				</form>
			</div>
		);
	}
}
