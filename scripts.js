//Inicializo variables
var app_diezmos = {};
app_diezmos.entradas = [];
app_diezmos.salidas = [];
app_diezmos.reservas = [];
var valor_previo = {}; // diccionario para validar números en textareas


function info(){	
	elem = document.getElementById("info_info");
	if (elem.style.display != "block"){
		elem.style.display= "block";
		info_buttom = document.getElementsByClassName('info_boton')[0];
		info_buttom.style.color= "red";
		info_buttom.style.borderColor= "red";
	} else {
		elem.style.display= "none";
		info_buttom = document.getElementsByClassName('info_boton')[0];
		info_buttom.style.color= "";
		info_buttom.style.borderColor= "";
	}
}
function clean(){
	// mostrar diálogo de confirmacion
	document.getElementById("dialogo_eliminartodo").classList.remove("oculto");
	
	// activa botón popup_OK
	document.getElementById("dialogo_eliminartodo").querySelector(".popup_OK").classList.add("popup_OK_validado"); // agrego clase de fondo color verde
}
function clean_ok(){
	//borrar todo registro de localstorage
	window.localStorage.removeItem('app_diezmos');

	//resetear datos de variable app_diezmos
	app_diezmos.entradas = [];
	app_diezmos.salidas = [];
	app_diezmos.reservas = [];

	// recargar html
	actualiza_entradas_HTML();
	actualiza_salidas_HTML();
	actualiza_reservas_HTML();

	//actualiza display
	calculos_display();

	// oculta dialogo de confirmación
	document.getElementById("dialogo_eliminartodo").classList.add("oculto");
}

// INICIO-----------------------------------

function inicio(){
	
	if ( test = window.localStorage.getItem('app_diezmos') ){ // Compruebo sí hay información guardada en localStorage        
		// recupero info en LocalStorag y grabo en variable
		app_diezmos = JSON.parse(window.localStorage.getItem('app_diezmos'));
		
		// actualizo HTML (las tres secciones)
		actualiza_entradas_HTML();
		actualiza_salidas_HTML();
		actualiza_reservas_HTML();

		//actualiza display
		calculos_display();

		console.log("había data, todo actualizado");
	} else {
		// No había información de diezmos guardada

		//ocultar dialogo de CARGANDO (hacer un dialogo fullscreeen simple)
		document.getElementById("disponible_numero").innerText = "0,00";

		// guardo valores predefinidos de la app en localStorage
		guardar_localstorage();

		console.log("no había data, data guardada");
	}
}

function nueva_entrada(element){
	// añade una entrada de diezmo nueva
	
	// muestra dialogo:
	let dialog= document.getElementById('dialogo_aniadirentrada');
	dialog.classList.remove('oculto');

	// add listeners to the textareas monto neto y diezmo, and to porcentaje:
	dialog.getElementsByTagName("textarea")[0].addEventListener("input", function() { validar_monto(this, "nuevaentrada") } );
	dialog.getElementsByTagName("textarea")[1].addEventListener("input", function() { validar_monto(this, "nuevaentrada") } );
	dialog.getElementsByTagName("select")[0].addEventListener("change", function() { porcentaje_calcular(this, "nuevaentrada") } );

}
function guarda_entrada(){
	// guarda entrada en localStorage y actualiza HTML

	// asigno el botón completo a variable 'element' (si se clickeó en el span)
	let element;
	if (event.target.tagName == "SPAN"){
		element =  event.target.parentNode;
	}else {
		element = event.target;
	}
	
	// obtengo valores ingresados
	let valores_a_guardar = [];
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="monto_neto_textarea"]')[0].value); //monto neto
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="diezmo_textarea"]')[0].value); //diezmo
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="porcentaje_select"]')[0].value); //porcentaje
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="dialogo_nota"]')[0].value); //nota
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="dialogo_fecha"]')[0].value); //fecha
	
	// salvo variable diezmo_app
	app_diezmos["entradas"].push(valores_a_guardar);

	
	// comprueba entrada guardada exitosamente
	// lo salteo, no creo que sea tan necesario
	
	// guardar en local storage
	guardar_localstorage("entradas");
	
	// actualiza entrada en HTML
	actualiza_entradas_HTML("nueva");
	
	// cierra popup
	oculta_dialogo(element);
}
function guardar_localstorage(tipo){
	// guarda variable app_diezmo en localstorage del navegador
	localStorage.setItem("app_diezmos", JSON.stringify(app_diezmos));
	calculos_display();
}
function calculos_display(){
	//// cálculos de montos para mostrar en display principal
	
	// suma diezmos
	let suma_diezmos = 0;
	app_diezmos.entradas.forEach(element => {
		suma_diezmos += parseFloat(element[1].substring(1)); // quito el signo monetario y convierto a número
	});
	console.log('total diezmos: ' + suma_diezmos);
	
	// suma salidas
	let suma_salidas = 0;
	app_diezmos.salidas.forEach(element => {
		suma_salidas += parseFloat(element[0].substring(1)); // quito el signo monetario y convierto a número
	});
	console.log('total salidas: ' + suma_salidas);
	
	// suma reservas
	let suma_reservas = 0;
	app_diezmos.reservas.forEach(element => {
		suma_reservas += parseFloat(element[0].substring(1)); // quito el signo monetario y convierto a número
	});
	console.log('total reservas: ' + suma_reservas);
	
	// actualiza displays en HTML
	document.getElementById("acumulado_numero").innerText= suma_diezmos.toFixed(2).toString();
	document.getElementById("entregado_numero").innerText= suma_salidas.toFixed(2).toString();
	document.getElementById("disponible_numero").innerText= (suma_diezmos - suma_salidas).toFixed(2).toString();
	document.getElementById("reservado_num").querySelector('span').innerText= suma_reservas.toFixed(2).toString(); // reservado
}
function actualiza_entradas_HTML(nota){
	// actualiza visualización en HTML
	
	//obtengo la entrada de muestra
	let original = document.getElementById("entrada_muestra");
	//oculto la entrada original:
	original.classList.add("oculto");

	//elimina todas las clonaciones de 'entradas' previas
	document.getElementById("entradas").querySelectorAll(".clonado").forEach(function(element){element.remove()});
	console.log("Entradas eliminadas");
	
	//clono la entrada
	let clonado = original.cloneNode(true);
	clonado.classList.remove("oculto", "muestra");
	clonado.classList.add("clonado"); //agrego identificador util para seleccionarlos despues

	//itero sobre diccionario de entradas
	app_diezmos.entradas.forEach(function(entrada, index, array){

		if (index === array.length -1){ //selecciona último elemento del diccionario
			//no funca por ahora
			// clonado.style.backgroundColor = "red"; //prueba
		}

		// cargo info del diccionario al clon
		let sin_simbolo_neto = entrada[0].substring(1);
		let sin_simbolo_diezmo = entrada[1].substring(1);
		clonado.querySelector(".entrada_monto num").textContent = sin_simbolo_neto; // monto neto
		clonado.querySelector(".entrada_diezmo num").textContent = sin_simbolo_diezmo; // diezmo
		clonado.querySelector(".entrada_porcentaje").textContent = entrada[2]; // porcentaje
		if (entrada[3] !== ''){
			clonado.querySelector(".entrada_nota").textContent = entrada[3]; // nota
		}
		if (entrada[4] !== ''){
			clonado.querySelector(".entrada_fecha").textContent = entrada[4]; // fecha
		}
		
		// creo una variable temporal para no insertar el clon (sino me cambian todos los elementos cuanto modifico el clon)
		let temp_clon = clonado.cloneNode(true);

		//Actualizo ID
		temp_clon.id = "entrada_" + index;

		// append element to the html
		original.insertAdjacentElement('afterend', temp_clon);

		console.log("original:", original);
		console.log("clonado:", clonado);
		console.log("index", index);

		console.log("");
		console.log("entrada", entrada);
		console.log("index", index);
		console.log("array", array);

	});
	// ANIMACION (resaltar item)
	// detecto la variable 'nota' existe
	try {
		nota == ""; //comparo con cualquier cosa para que salga si crashea

		//continúa ya que no crasheó (la nota existe!)

		// resalto ultima entrada agregada (ayuda visual para el usuario)
		if (nota == "nueva"){ // solo si no estoy eliminando item
			resaltar_nuevoitem("entrada_muestra");
		}else if (nota.split('_')[0] == "entrada"){ // detecto si se está moviendo un item
			// selecciono item anterior al que quiero resaltar
			resaltar_nuevoitem(nota);
		}else if (nota =="eliminar"){
			guardar_localstorage();
		}
	} catch (error){ console.log("no hay nota"); }
}


function nueva_salida(){
	// añade una salida de diezmo nueva
	
	// muestra dialogo:
	let dialog= document.getElementById('dialogo_aniadirsalida');
	dialog.classList.remove('oculto');
	
	// add listener to the textarea monto
	dialog.getElementsByTagName("textarea")[0].addEventListener("input", function() { validar_monto(this, "salida") } );
}
function guarda_salida(){
	// guarda salida en localStorage y actualizo HTML

	// asigno el botón completo a variable 'element' (si se clickeó en el span)
	let element;
	if (event.target.tagName == "SPAN"){
		element =  event.target.parentNode;
	}else {
		element = event.target;
	}

	// obtengo valores ingresados
	let valores_a_guardar = [];
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="diezmo_textarea"]')[0].value); //diezmo
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="dialogo_nota"]')[0].value); //nota
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="dialogo_fecha"]')[0].value); //fecha

	// salvo variable diezmo_app
	app_diezmos["salidas"].push(valores_a_guardar);

	// comprueba salida guardada exitosamente
	// lo salteo, no creo que sea tan necesario
	
	// guardar en local storage
	guardar_localstorage("salidas");
	
	// actualiza salidas en HTML
	actualiza_salidas_HTML("nueva");

	// cierra popup
	oculta_dialogo(element);
}
function actualiza_salidas_HTML(nota){
	// actualiza visualización en HTML
	
	//obtengo la salida de muestra
	let original = document.getElementById("salida_muestra");
	//oculto la salida original:
	original.classList.add("oculto");

	//elimina todas las clonaciones de 'salidas' previas
	document.getElementById("salidas").querySelectorAll(".clonado").forEach(function(element){element.remove()});
	console.log("Salidas eliminadas");
	
	//clono la entrada
	let clonado = original.cloneNode(true);
	clonado.classList.remove("oculto", "muestra");
	clonado.classList.add("clonado"); //agrego identificador util para seleccionarlos despues

	//itero sobre diccionario de entradas
	app_diezmos.salidas.forEach(function(salida, index, array){

		if (index === array.length -1){ //selecciona último elemento del diccionario
			//no funca por ahora
			// clonado.style.backgroundColor = "red"; //prueba
		}

		// cargo info del diccionario al clon
		let sinsimbolo_diezmo = salida[0].substring(1);
		clonado.querySelector(".salida_monto num").textContent = sinsimbolo_diezmo; // diezmo
		if (salida[1] !== ''){
			clonado.querySelector(".entrada_nota").textContent = salida[1]; // nota
		}
		if (salida[2] !== ''){
			clonado.querySelector(".entrada_fecha").textContent = salida[2]; // fecha
		}
		
		// creo una variable temporal para no insertar el clon (sino me cambian todos los elementos cuanto modifico el clon)
		let temp_clon = clonado.cloneNode(true);

		//Actualizo ID
		temp_clon.id = "salida_" + index;

		// append element to the html
		original.insertAdjacentElement('afterend', temp_clon);

		console.log("original:", original);
		console.log("clonado:", clonado);
		console.log("index", index);

		console.log("");
		console.log("entrada", salida);
		console.log("index", index);
		console.log("array", array);

	});
	// ANIMACION (resaltar item)
	// detecto la variable 'nota' existe
	try {
		nota == ""; //comparo con cualquier cosa para que salga si crashea

		//continúa ya que no crasheó (la nota existe!)

		// resalto ultima entrada agregada (ayuda visual para el usuario)
		if (nota == "nueva"){ // solo si no estoy eliminando item
			resaltar_nuevoitem("salida_muestra");
		}else if (nota.split('_')[0] == "salida"){ // detecto si se está moviendo un item
			// selecciono item anterior al que quiero resaltar
			resaltar_nuevoitem(nota);
		}else if (nota =="eliminar"){
			guardar_localstorage();
		}
	} catch (error){ console.log("no hay nota"); }
}
function nueva_reserva(){
	// añade una reserva de diezmo nueva
	
	// muestra dialogo:
	let dialog= document.getElementById('dialogo_aniadirreserva');
	dialog.classList.remove('oculto');
	
	// add listener to the textarea monto
	dialog.getElementsByTagName("textarea")[0].addEventListener("input", function() { validar_monto(this, "reserva") } );
}
function guarda_reserva(){
	// guarda reserva en localStorage y actualiza HTML
	
	// asigno el botón completo a variable 'element' (si se clickeó en el span)
	let element;
	if (event.target.tagName == "SPAN"){
		element =  event.target.parentNode;
	}else {
		element = event.target;
	}

	// obtengo valores ingresados
	let valores_a_guardar = [];
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="diezmo_textarea"]')[0].value); //diezmo
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="dialogo_nota"]')[0].value); //nota
	valores_a_guardar.push(element.parentNode.querySelectorAll('[name="dialogo_fecha"]')[0].value); //fecha

	// salvo variable diezmo_app
	app_diezmos["reservas"].push(valores_a_guardar);

	// comprueba salida guardada exitosamente
	// lo salteo, no creo que sea tan necesario
	
	// guardar en local storage
	guardar_localstorage("reservas");
	
	// actualiza salidas en HTML
	actualiza_reservas_HTML("nueva");

	// cierra popup
	oculta_dialogo(element);
}
function actualiza_reservas_HTML(nota){
	// actualiza visualización en el HTML
	
	//obtengo la reserva de muestra
	let original = document.getElementById("reserva_muestra");
	//oculto la salida original:
	original.classList.add("oculto");

	//elimina todas las clonaciones de 'reservas' previas
	document.getElementById("reservas").querySelectorAll(".clonado").forEach(function(element){element.remove()});
	console.log("Reservas eliminadas");
	
	//clono la entrada
	let clonado = original.cloneNode(true);
	clonado.classList.remove("oculto", "muestra");
	clonado.classList.add("clonado"); //agrego identificador util para seleccionarlos despues

	//itero sobre diccionario de salidas
	app_diezmos.reservas.forEach(function(reserva, index, array){

		if (index === array.length -1){ //selecciona último elemento del diccionario
			//no funca por ahora
			// clonado.style.backgroundColor = "red"; //prueba
		}

		// cargo info del diccionario al clon
		let sinsimbolo_diezmo = reserva[0].substring(1);
		clonado.querySelector(".reserva_monto num").textContent = sinsimbolo_diezmo; // diezmo
		if (reserva[1] !== ''){
			clonado.querySelector(".entrada_nota").textContent = reserva[1]; // nota
		}
		if (reserva[2] !== ''){
			clonado.querySelector(".entrada_fecha").textContent = reserva[2]; // fecha
		}
		
		// creo una variable temporal para no insertar el clon (sino me cambian todos los elementos cuanto modifico el clon)
		let temp_clon = clonado.cloneNode(true);

		//Actualizo ID
		temp_clon.id = "reserva_" + index;

		// append element to the html
		original.insertAdjacentElement('afterend', temp_clon);

		console.log("original:", original);
		console.log("clonado:", clonado);
		console.log("index", index);

		console.log("");
		console.log("reserva", reserva);
		console.log("index", index);
		console.log("array", array);

	});
	// ANIMACION (resaltar item)
	// detecto la variable 'nota' existe
	try {
		nota == ""; //comparo con cualquier cosa para que salga si crashea

		//continúa ya que no crasheó (la nota existe!)

		// resalto ultima entrada agregada (ayuda visual para el usuario)
		if (nota == "nueva"){ // solo si no estoy eliminando item
			resaltar_nuevoitem("reserva_muestra");
		}else if (nota.split('_')[0] == "reserva"){ // detecto si se está moviendo un item
			// selecciono item anterior al que quiero resaltar
			resaltar_nuevoitem(nota);
		}else if (nota =="eliminar"){
			guardar_localstorage();
		}
	} catch (error){ console.log("no hay nota"); }

}
function oculta_dialogo(element){
	//limpio info primero

	for (i = 0; i < element.parentNode.getElementsByTagName('textarea').length; i++){
		element.parentNode.getElementsByTagName('textarea')[i].value = ''; //textareas
	}
	if (element.parentNode.getElementsByTagName('select')[0]){
		element.parentNode.getElementsByTagName('select')[0].selectedIndex = 0; //reset porcentaje
	} 

	// remove listeners on popup_ok buttom
	element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_entrada);
	element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_salida);
	element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_reserva);

	//oculto dialogo:
	element.parentNode.classList.add("oculto");

	//desactivo botonOK
		element.parentNode.querySelector(".popup_OK").classList.remove("popup_OK_validado"); //remuevo clase de fondo color verde
		element.parentNode.querySelector(".popup_OK").classList.add("popup_OK_novalidado"); // agrego clase de fondo color gris
	

	// reseteo diccionario de valores previos (se usaban para validar textareas)
	Objetc.keys(valor_previo).forEach(key => delete valor_previo[key]);
}

function validar_monto(element, dialogo){
	//validación de solo numeros con comas decimales
	
	//patrón o formato deseado:
	var pattern = /^\$\d+[,\.]{0,1}\d{0,2}$/; //patrón que permine solo numeros, comas y puntos
	var pattern2 = /^\$(0{2,}|0+\d+|[.,]+|[0.,]+$)+\d*/; //patrón que califica un formato de númro-dinero válido

	var clave = element.name; // uso el nombre (name) como clave de diccionario
	var valor_actual = element.value; //current value

	//agrego simbolo monetario si no tiene
	if (valor_actual[0] != "$"){
		var valor_actual = "$" + element.value;
	} else if (valor_actual == "$"){
		valor_previo[clave] = valor_actual;
	}
	
	//chequeo si el nuevo valor está OK
	if (pattern.test(valor_actual)) {
		//salvo valor actual que es correcto
		valor_previo[clave] = valor_actual;
		//actualizo textarea (por si no tenía signo monetario)
		element.value = valor_actual;

		// interactúa entre monto neto y diezmo (cálculos)
		if (element.name == "monto_neto_textarea"){
			// calcular diezmo
			//obtengo porcentaje
			let porcentaje= element.parentNode.getElementsByTagName("select")[0].value;
			// cuenta
			let resultado = parseFloat(element.value.slice(1).replace(/,/g, '.')) * parseFloat(porcentaje.slice(0,-1)) / 100;
			// actualizo valor en textarea diezmo
			let textarea_diezmo = element.parentNode.getElementsByTagName("textarea")[1];
			textarea_diezmo.value = "$" + resultado.toFixed(2);
			//actualizo dic
			valor_previo[textarea_diezmo.name] = textarea_diezmo.value;
		} else if (element.name == "diezmo_textarea" && dialogo !== "salida" && dialogo !== "reserva"){
			// limpia monto neto
			element.parentNode.getElementsByTagName("textarea")[0].value="";
			valor_previo['monto_neto_textarea'] = '';
		}
		// activo el botón OK si el textarea actual y textarea de diezmo (si es otra) pasan el segundo patrón (si el formato de número es válido)
		let diezmo_textarea_value = element.parentNode.querySelector(".diezmo_textarea").value;
		if (!pattern2.test(diezmo_textarea_value) && !pattern2.test(element.value)){
			element.parentNode.querySelector(".popup_OK").classList.remove("popup_OK_novalidado"); //remuevo clase de fondo color gris
			element.parentNode.querySelector(".popup_OK").classList.add("popup_OK_validado"); // agrego clase de fondo color verde

			// agrego evento al botón:
			if (dialogo == "nuevaentrada"){
				element.parentNode.querySelector(".popup_OK").addEventListener("click", guarda_entrada); // agrego onclick evento
			} else if (dialogo == "salida"){
				element.parentNode.querySelector(".popup_OK").addEventListener("click", guarda_salida); // agrego onclick evento
			} else if (dialogo == "reserva"){
				element.parentNode.querySelector(".popup_OK").addEventListener("click", guarda_reserva); // agrego onclick evento
			}
		}else {
			element.parentNode.querySelector(".popup_OK").classList.remove("popup_OK_validado"); //remuevo clase de fondo color verde
			element.parentNode.querySelector(".popup_OK").classList.add("popup_OK_novalidado"); // agrego clase de fondo color gris

			// remuevo evento al botón:
			if (dialogo == "nuevaentrada"){
				element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_entrada);
			} else if (dialogo == "salida"){
				element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_salida);
			} else if (dialogo == "reserva"){
				element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_reserva);
			}
		}
	} else {
		console.log("no coincide con el patrón");
		// se violó el patrón, reviso si había un valor previo
		if (clave in valor_previo) {
			//la variable existe dentro del diccionario
			element.value = valor_previo[clave];
		} else {
			// no había valor previo, queda la caja vacía
			element.value = "";
		}
	}
	//desactivo el botón OK/aceptar, si hay solo un caracter (signo monetario), o si el patrón es incorrecto
	let diezmo_textarea_value = element.parentNode.querySelector(".diezmo_textarea").value;
	if (diezmo_textarea_value.length < 2 || pattern2.test(diezmo_textarea_value)){
		element.parentNode.querySelector(".popup_OK").classList.remove("popup_OK_validado"); //remuevo clase de fondo color verde
		element.parentNode.querySelector(".popup_OK").classList.add("popup_OK_novalidado"); // agrego clase de fondo color gris

		// remuevo evento al botón:
		if (dialogo == "nuevaentrada"){
			element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_entrada);
		} else if (dialogo == "salida"){
			element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_salida);
		} else if (dialogo == "reserva"){
			element.parentNode.querySelector(".popup_OK").removeEventListener("click", guarda_reserva);
		}

	}
}
function porcentaje_calcular(element){
	//calcula nuevos valores de porcentaje para monto
	
	let monto = element.parentNode.getElementsByTagName("textarea")[0];
	// chequear si hay monto con símbolo pesos más al menos un dígito
	if (monto.value.length > 1){
		validar_monto(monto);
	}
}
function menu_item(tipo){
	// muestra un menú de opciones para el item seleccionado
	
	// chequeo si el menu ya estaba abierto en este item
	if (event.target.parentNode.nextSibling.id == "menu_item_abierto"){
		event.target.parentNode.style.background = ''; //restore normal background
		event.target.parentNode.nextSibling.remove();
		return; // se cierra menú y se sale
	}

	// chequeo otro posible menú abierto y lo destruyo
	let menuitem = document.getElementById('menu_item_abierto');
	if (menuitem){
		menuitem.previousSibling.style.background = '';
		menuitem.remove();
	}
	
	// remarcar entrada seleccionada
	event.target.parentNode.style.backgroundColor = "#ffc14e";

	// mostrar opciones
	// clono entrada orig
	let clon = event.target.parentNode.cloneNode(true);
	clon.id = "menu_item_abierto";
	clon.classList.add("menu_item");
	clon.innerHTML = `<div onclick="eliminar_item('${tipo}')">❌Eliminar</div><div onclick="cambiar_posicion('${tipo}','sube')">⬆️Subir</div><div onclick="cambiar_posicion('${tipo}', 'baja')">⬇️Bajar</div>`; // estoy usando backtics para envolver el string ``` (no son comillas simples)

	let tmp = clon;

	event.target.parentNode.insertAdjacentElement('afterend', tmp);
}
function eliminar_item(tipo){
	// elimino un item ya sea una Entrada; Salida; Reserva
	
	//capturo entrada deseada
	let entrada = event.target.parentNode.previousSibling;

	// actualizo variable global
	if (tipo == "entrada"){
		//elimino item
		let indice = entrada.id.split('_')[1];
		app_diezmos.entradas.splice(indice, 1); //remueve '1' item desde el rango indicado
		//actualiza HTML
		actualiza_entradas_HTML("eliminar");
	} else if (tipo == "salida"){
		//elimino item
		let indice = entrada.id.split('_')[1];
		app_diezmos.salidas.splice(indice, 1); //remueve '1' item desde el rango indicado
		//actualiza HTML
		actualiza_salidas_HTML("eliminar");
	} else if (tipo == "reserva"){
		//elimino item
		let indice = entrada.id.split('_')[1];
		app_diezmos.reservas.splice(indice, 1); //remueve '1' item desde el rango indicado
		//actualiza HTML
		actualiza_reservas_HTML("eliminar");
	}

	//actualiza display
	calculos_display();
}
function cambiar_posicion(tipo, pos){
	// sube una posición del item deseado
	
	//capturo entrada deseada
	let entrada = event.target.parentNode.previousSibling;
	
	// obtengo indice de item
	let indice = entrada.id.split('_')[1];

	// calculo  nueva posicion
	let nuevaposicon;
	if (pos == "sube"){
		//seteo la subida a partir del índice
		nuevaposicion = parseInt(indice) + 1;
	} else {
		//seteo la bajada a partir del índice
		nuevaposicion = parseInt(indice) - 1;
	}

	// edito variable app_diezmos
	let item = app_diezmos[tipo+"s"].splice(indice, 1); // elimina elemento de app_diezmos, y lo guarda en una var
	app_diezmos[tipo+"s"].splice(nuevaposicion, 0, item[0]); // inserta elemento más arriba (en la práctica es más abajo en el array)

	// guardo en localStorage
	guardar_localstorage(tipo+"s");
	
	//actualizo HTML con el nuevo orden
	if ( (tipo+"s") == "entradas"){
		actualiza_entradas_HTML("entrada_" + nuevaposicion );
	} else if ( (tipo+"s") == "salidas"){	
		actualiza_salidas_HTML("salida_" + nuevaposicion );
	} else if ( (tipo+"s") == "reservas"){
		actualiza_reservas_HTML("reserva_" + nuevaposicion );
	}
}
function resaltar_nuevoitem(id){
	//resalta ultima entrada o entrada que se mueve (ayuda visual para el usuario)
	
	var item = document.getElementById(id);

	if (id.split('_')[1] == "muestra"){ //detecto estoy seleccionando muestra 'reserva_muestra', etc.
		item = item.nextSibling; //selecciono primer item de la lista
	}
	item.classList.add("animacion_nuevoitem");
	setTimeout(() => {
		console.log("sleep...");
		item.style.backgroundColor="#93EA00ff";
		setTimeout(() => {
			item.style.backgroundColor="#00808000";
		}, 600);
	}, 80);
}

//petición de persistencia al navegador, para para que no elimine los archivos cacheados con serviceworker y demás datos en localStorage. (No es infalible)
async function asegurarPersistencia() {
  if (navigator.storage?.persist) {
    await navigator.storage.persist().then(persistencia => {alert('persistencia?: ' + persistencia)});
  }
}
