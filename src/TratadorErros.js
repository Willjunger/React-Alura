import PubSub from "pubsub-js";

export default class TratadorErros {
	publicaErros(erros) {
		for (var i = 0; i < erros.data.errors.length; i++) {
			var erro = erros.data.errors[i];
			PubSub.publish("erro-validacao", erro);
		}
	}
}
