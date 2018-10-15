<template>
    <div class="container">
            <!-- Chat -->
            <div class="chat hoverable">
                <!-- Barra de título -->
                <div class="chat-title-bar blue lighten-4" 
                    @click="upDown($event)">
                    <div class="user pl-0-5">
                        <i class="material-icons fs-0-8 green-text">brightness_1</i>
                        <span class="pl-0-5">{{ user }}</span>
                    </div>
                    <!-- Muestra de mensajes nuevos -->
                    <div v-if="numMessages" class="alert">
                        <i class="material-icons green-text">email</i>
                        <span class="new badge" data-badge-caption="nuevos">
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
                    @keydown.enter.prevent="print('me')">
                    </textarea>
                    <button class="btn green lighten-1" @click="print('me')">
                    <i class="material-icons">send</i></button>
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
    data() {
        return {
            /* Mensaje que se escribe */
            message: '',
            rivalMessage: '',
            /* Número de mensajes nuevos */
            numMessages: 0,
            /* Saber si el chat se está abriendo o cerrando */
            cont: 1
        }
    },
    created() {
      this.socket.on('newmessage', message => {
          this.rivalMessage = message;
          /* Imprimir el mensaje del rival */
          this.print('rival');
      });  
    },
    methods: {
        /* Mostrar/ocultar el chat */
        upDown() {
            /* chat */
            let chat = document.querySelector('.chat');
            /* Cuerpo del chat */
            let body = document.querySelector('.chat-body');
            /* Cuando se va a abrir el chat */
            if (this.cont % 2 === 1) {
                body.scrollTop = body.scrollHeight;
                chat.style.cssText = 'transform: translateY(0);';
                setTimeout( () => {
                    document.querySelector('.text-area').focus();
                },500);
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
                    /* Mantener solo cierta cantidad de mensajes en el chat */
                    if (content.children.length === 10) {
                        /* Cuando excede el límite se va eliminando el primero */
                        content.removeChild(content.children[0]);
                    } 
                    /* Añadir el nuevo mensaje al DOM */
                    content.appendChild(newMessage);
                    /* Bajar la barra de desplazamiento hasta el nuevo mensaje */
                    content.scrollTop = content.scrollHeight;
                    /* Poner foco en el textarea */
                    document.querySelector('.text-area').focus();
                    /* Borrar contenido escrito */
                    this.message = '';
                    this.numMessages++;
                }
            } else if (user === 'rival') {
                /* Agregarle sus respectivas clases */
                newMessage.setAttribute('class', 'message chat-rival');
                /* Añadirle contenido HTML */
                newMessage.innerHTML = `
                    <span> ${this.rivalMessage} </span>
                    <small> ${this.time()} </small>`;
                /* Mantener solo cierta cantidad de mensajes en el chat */
                if (content.children.length === 10) {
                    /* Cuando excede el límite se va eliminando el primero */
                    content.removeChild(content.children[0]);
                } 
                /* Añadir el nuevo mensaje al DOM */
                content.appendChild(newMessage);
                /* Bajar la barra de desplazamiento hasta el nuevo mensaje */
                content.scrollTop = content.scrollHeight;
                /* Borrar contenido escrito */
                this.rivalMessage = '';
                this.numMessages++;
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
