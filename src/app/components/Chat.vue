<template>
    <div class="container">
        <div class="chat-container">
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
                    @keydown.enter.prevent="print($event)">
                    </textarea>
                    <button class="btn green lighten-1" @click="print($event)">
                    <i class="material-icons">send</i></button>
                </div>
                <!-- Fin de envío de mensaje -->
            </div>
            <!-- Fin chat -->
        </div>
    </div>
</template>
<script>
export default {
    name: 'chat',
    data() {
        return {
            /* Mensaje que se escribe */
            message: '',
            /* Número de mensajes nuevos */
            numMessages: 0,
            /* Saber si el chat se está abriendo o cerrando */
            open: false
        }
    },
    methods: {
        /* Mostrar/ocultar el chat */
        upDown(e) {
            /* chat */
            let chat = document.querySelector('.chat');
            /* Cuerpo del chat */
            let body = document.querySelector('.chat-body');
            /* Mostrar u ocultar el chat */
            chat.classList.toggle('chat-toggle');
            /* Bajar la barra de desplazamiento */
            body.scrollTop = body.scrollTopMax;
            /* Recorrer las clases que tenga el nodo */
            for (let className of chat.classList) {
                /* Cuando contenga esta clase es porque el chat está abierto */
                if (className === 'chat-toggle') {
                    this.open = true;
                    /* Para que el chat se ponga por encima del tablero triki */
                    document.querySelector('.chat-container').style.cssText = 'z-index:100;';
                    /* Esperar el tiempo que tarda en abrir el chat para colocar el foco */
                    setTimeout( () => {
                        document.querySelector('.text-area').focus();
                    },500);
                    break;
                } else {
                    this.open = false;
                }
            }
            /* Cuando se va a cerrar, poner el chat por debajo del tablero */
            if (!this.open) {
                setTimeout( () => {
                    document.querySelector('.chat-container').style.cssText = 'z-index:-1;';
                },500);
            }
        },
        /* Pegar los mensajes escritos en el chat */
        print() {
            /* Cuando se haya escrito algo */
            if (this.message) {
                /* Donde se pegan los mensajes */
                let content = document.querySelector('.chat-body');
                /* Nodo del nuevo mensaje a pegar */
                let newMessage = document.createElement('div');
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
                content.scrollTop = content.scrollTopMax;
                /* Poner foco en el textarea */
                document.querySelector('.text-area').focus();
                /* Borrar contenido escrito */
                this.message = '';
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
        }
    }
}
</script>
