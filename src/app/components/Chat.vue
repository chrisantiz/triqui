<template>
    <div class="container">
            <!-- Chat -->
            <div class="chat hoverable">
                <!-- Barra de título -->
                <div class="chat-title-bar blue lighten-4"
                    @click="upDown($event)">
                    <div class="user pl-0-5">
                        <i class="material-icons fs-0-8 green-text">brightness_1</i>
                        <span class="pl-0-5">{{ user }}
                            <transition name="fade">
                                <small
                                    style="font-style:italic;"
                                    v-if="rivalTyping">
                                    está escribiendo ...
                                </small>
                            </transition>
                        </span>
                    </div>
                    <!-- Muestra de mensajes nuevos -->
                    <div v-if="numMessages" class="alert">
                        <i class="material-icons green-text"
                            style="line-height:36px;">email
                        </i>
                        <span class="badge"
                            style="min-width:1rem;margin:0;line-height:36px;">
                            {{ numMessages }}
                        </span>
                    </div>
                </div>
                <!-- Fin barra de título -->
                <!-- Cuerpo del chat -->
                <div class="chat-body white">
                </div>
                <!-- Fin cuerpo del chat -->
                <!-- Envío de mensaje -->
                <div class="chat-send-message">
                    <textarea class="text-area"
                    v-model="message"
                    @keydown.enter.prevent="print('me')"
                    @input="isTyping"
                    @focus="chatFocus">
                    </textarea>
                    <button class="btn green lighten-1"
                        @click="print('me')">
                        <i class="material-icons">send</i>
                    </button>
                </div>
                <!-- Fin de envío de mensaje -->
            </div>
            <!-- Fin chat -->
    </div>
    <!-- Fin container -->
</template>
<script>
export default {
    name: 'chat',
    /* -------------------- VARIABLES ---------------------- */
    data() {
        return {
            /* Mensaje que se escribe */
            message: '',
            rivalMessage: '',
            /* Número de mensajes nuevos */
            numMessages: 0,
            /* Saber si el chat se está abriendo o cerrando */
            cont: 1,
            /* Nodo del primer mensaje no leído */
            firstNode: null,
            /* Indicar cuando debe hacer scroll automático en el chat */
            scroll: true,
            /* Saber cuando el usuario está escribiendo */
            typing: false,
            /* Tiempo en el cual se empezó a escribir el último mensaje */
            lastTypingTime: 0,
            /* Indica si el rival está escribiendo un mensaje */
            rivalTyping: false
        }
    },
    /* --------------------- MOUNTED ------------------------ */
    mounted() {
        /* ------------------- Eventos Socket.IO --------------------- */
        /* Mientras se está escribiendo */
        this.socket.on('typing', () => {
            this.rivalTyping = true;
        });
        /* Cuando el rival para de escribir  */
        this.socket.on('stoptyping', () => {
            this.rivalTyping = false;
        });
        /* Recibir un nuevo mensaje */
        this.socket.on('newmessage', message => {
            this.rivalMessage = message;
            /* Imprimir el mensaje del rival */
            this.print('rival');
            /* Cuerpo del chat */
            let body = document.querySelector('.chat-body');
            /* Nuevo nodo a insertar */
            let div = document.createElement('div');
            /* Para colocar el mensaje solo una vez */
            if (this.numMessages === 1) {
                this.scroll = false;
                /* Mensaje de 'no leídos' apartir del primer mensaje no leído */
                div.setAttribute('class', 'no-read');
                div.innerHTML = `<div>
                                    <span>No leídos</span>
                                </div>`;
                /* Añadirlo antes del primer primer mensaje no leído */
                body.insertBefore(div, this.firstNode);
            }
            /* Si existe la alerta de que hay mensajes sin leer, que el scroll no pase de ahí */
            if (document.querySelector('.no-read')) {
                body.scrollTop = document.querySelector('.no-read').offsetTop - 50;
            }
        });
    },
    /* ------------------- MÉTODOS --------------------- */
    methods: {
        /* Cuando se coloca el foco al textarea de envío de mensajes */
        chatFocus() {
            /* Resetear el contador de mensajes no leídos */
            this.numMessages = 0;
            /* Indicar que sí se podrá hacer scroll */
            this.scroll = true;
            /* Eliminar el mensaje de 'no leídos' del chat */
            let body = document.querySelector('.chat-body');
            /* Cuando exista un mensaje avisando que hay mensajes sin leer se quita */
            if (body.querySelector('.no-read')) {
                let node = body.querySelector('.no-read');
                body.removeChild(node);
            }
        },
        /* Mientras se escribe */
        isTyping(){
            if (!this.typing) {
                this.typing = true;
                this.socket.emit('typing');
            }
            // Tiempo desde la última tecla presionada
            this.lastTypingTime = (new Date()).getTime();
            setTimeout( () => {
                // Tiempo luego de 700ms
                let typingTimer = new Date().getTime();
                // Tiempo transcurrido entre los dos anteriores
                let timeDiff = typingTimer - this.lastTypingTime;
                if (timeDiff >= 700 && this.typing) {
                    this.socket.emit('stoptyping');
                    this.typing = false;
                }
            }, 700);
        },
        /* Mostrar/ocultar el chat */
        upDown() {
            /* chat */
            let chat = document.querySelector('.chat');
            /* Cuerpo del chat */
            let body = document.querySelector('.chat-body');
            /* Cuando se va a abrir el chat */
            if (this.cont % 2 === 1) {
                chat.style.cssText = 'transform: translateY(0);';
                /* Cuando no hayan mensajes nuevos se coloca el foco automáticamente */
                if (this.numMessages === 0) {
                    body.scrollTop = body.scrollHeight;
                    setTimeout( () => {
                        document.querySelector('.text-area').focus();
                    },500);
                }
                this.cont++;
            } else {
                /* Cuando se va a cerrar */
                chat.style.cssText = 'transform: translateY(90%);';
                this.cont--;
            }
        },
        /* Pegar los mensajes escritos en el chat */
        print(user) {
            /* Donde se pegan los mensajes */
            let content = document.querySelector('.chat-body');
            /* Nodo del nuevo mensaje a pegar */
            let newMessage = document.createElement('div');
            /* Cuando el mensaje es escrito por el mismo rival */
            if (user === 'me') {
                /* Cuando se haya escrito algo */
                if (this.message) {
                    /* Enviar mensaje al rival */
                    this.socket.emit('newmessage', this.message);
                    /* Agregarle sus respectivas clases */
                    newMessage.setAttribute('class', 'message chat-me');
                    /* Añadirle contenido HTML */
                    newMessage.innerHTML = `
                        <span> ${this.message} </span>
                        <small> ${this.time()} </small>`;
                    /* Añadir el nuevo mensaje al DOM */
                    content.appendChild(newMessage);
                    /* Bajar la barra de desplazamiento hasta el nuevo mensaje */
                    content.scrollTop = content.scrollHeight;
                    /* Poner foco en el textarea */
                    document.querySelector('.text-area').focus();
                    /* Borrar contenido escrito */
                    this.message = '';
                }
                /* Cuando el mensaje viene del el rival */
            } else if (user === 'rival') {
                /* Agregarle sus respectivas clases */
                newMessage.setAttribute('class', 'message chat-rival');
                /* Añadirle contenido HTML */
                newMessage.innerHTML = `
                    <span> ${this.rivalMessage} </span>
                    <small> ${this.time()} </small>`;
                /* Añadir el nuevo mensaje al DOM */
                content.appendChild(newMessage);
                /* Bajar la barra de desplazamiento hasta el nuevo mensaje, cuando se van leyendo */
                if (this.scroll) {
                    content.scrollTop = content.scrollHeight;
                }
                /* Borrar contenido escrito */
                this.rivalMessage = '';
                this.numMessages++;
                /* Guardar el primer elemento no leído */
                if (this.numMessages === 1) {
                    this.firstNode = newMessage;
                }
            }
        },
        /* Obtener la hora actual en que se envía un mensaje */
        time() {
            let date = new Date();
            let hour = (date.getHours() < 10) ? `0${date.getHours()}`: date.getHours();
            let minute = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes();
            return `${hour}:${minute}`;
        }
    },
    /* ------------------ PROPIEDADES --------------------- */
    props: {
        user: {
            required: true,
            type: String
        },
        socket: {
            required: true
        }
    }
}
</script>