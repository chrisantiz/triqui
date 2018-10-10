<template>
    <div v-if="redirectTo === 0">
        <!-- RENDERIZAR COMPONENTE BARRA SUPERIOR Y LATERAL -->
        <sidenav :nick="this.nick" @closession="closeSession" />
        <!-- CONTENEDOR -->
        <div class="row container">
            <div class="section">
                <h5 class="center">Usuarios conectados</h5>
            </div>

            <!-- USUARIOS CONECTADOS -->
            <div class="col s12 m8 l6 push-m2 push-l3">
                <!-- TABLA LISTADO DE USUARIOS -->
                <table>
                    <tr 
                        class="d-flex jc-space-around"
                        v-for="(user, index) in users" :key="index">
                        <!-- Ícono que indica estado de conexión -->
                        <td>
                            <i class="material-icons fs-1 line-height-40 green-text" 
                            :class="{'orange-text' : !bind.active}">brightness_1</i>
                        </td>
                        <!-- Nombre del usuario -->
                        <td class="fs-1-5">{{user.nick}}</td>
                        <!-- Botón para retar -->
                        <td>
                            <button 
                                class="btn blue waves-effect waves-light" :disabled="user.fight || bind.waitResponse" @click="challenge(user.nick)">

                                <i class="material-icons right"                 style="font-size:2rem;font-weight:bold">chevron_right
                                </i>

                                Retar
                            </button>
                        </td>

                    </tr>
                </table>
                <!-- FIN TABLA LISTADO DE USUARIOS -->
            </div>
            <!-- FIN USUARIOS CONECTADOS -->
        </div>
        <!-- FIN CONTENEDOR -->
        
        <!-- Precargador -->
        <transition name="fade" mode="out-in">
            <div v-if="bind.waitResponse" class="spinner">
                <spinner size="medium" />
                <button 
                    class="btn red lighten-1 waves-effect waves-light mt-2" 
                    @click="cancelChallenge">
                    Cancelar
                </button>
            </div>
        </transition>
        <!-- Fin precargador -->

        <!-- MODAL -->
        <!-- Modal -->
        <div class="modal" id="userLogOut">
            <div class="modal-content">
                <div class="modal-body d-flex flex-column align-items-center">
                    <div><i class="material-icons fs-5 red-text">warning</i></div>
                    <h5 class="center">Tu sesión ha caducado.</h5>
                </div>
                <div class="modal-footer d-flex jc-center">
                    <router-link 
                        to="/"
                        class="btn red waves-effect waves-light">
                        Salir
                    </router-link>
                </div>
            </div>
        </div>
        <!-- FIN MODAL -->
    </div>
</template>
<script>
// Componente barra lateral y menú
import Sidenav from './helpers/SideNav.vue';
// Componente del Spinner de precarga
import Spinner from './helpers/Spinner.vue';
// Socket
import {socket} from '../socketClient';
// import io from 'socket.io-client';
// const socket = io('http://127.0.0.1:3000');
// Alertas
import swal from 'sweetalert';

export default {
    data() {
        return {
            // Usuarios en línea
            users: [],
            // El nick del usuario actual
            nick:'',
            // Indica si se tiene que redirigir o no al login
            redirectTo: null,
            // Nick del jugador retado (útil para cancelar un reto)
            otherPlayer: '',
            // Saber si el reto ha sido cancelado
            challengeCanceled: false,
            bind: {
                // Permite inhabilitar el botón de retar cuando hay una petición en curso
                waitResponse: false,
                active: true 
            }
        }
    },
    created() {
        // Cuando se carga la página desde la url
        if(!this.redirected) {
            // Comprobar si hay un token en el local storage
            if(localStorage.getItem('token')) {
                let url = (localStorage.getItem('path'))
                        ? localStorage.getItem('path')
                        : null;
                // Se hace una petición para comprobar el token
                this.axios({
                    method: 'POST',
                    url:'/api/token',
                    data: {
                        path: url
                    },
                    headers: {
                        auth: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                .then(res => res.data)
                .then(data => {
                    /* Datos de sesión */
                    let {auth} = data;
                    let status = null;
                    /* Información sobre alguna partida activa */
                    if (url) status = data.status;
                    // Si hay un usuario con la sesión iniciada y sin expirar
                    if(auth.status.code === 200) {
                        /* Cuando tiene un juego abierto y disponible */
                        if(status === 1) {
                            window.location.href = url;
                        /* Si no, se deja en la página */
                        } else {
                            this.nick = auth.data.nick;
                            this.redirectTo = 0;
                        }
                    } else {
                        // Si no se manda al login
                        this.redirectTo = 1;
                        this.$router.push({name:'login'});
                    }
                })
                .catch(err => console.log(err))
            } else {
                // Si no hay ningún token se manda al login
                this.redirectTo = 1;
                this.$router.push({name:'login'});
            }
        } else {
            // Cuando se he redirigido desde el login
            this.redirectTo = 0;
            this.nick = this.data.nick;
        }
        /* --------- Evento para cancelar un reto -------- */
        socket.on('cancelchallenge', user => {
            if (this.nick === user) {
                this.challengeCanceled = true;
                swal.close();
            }
        });
        /* ---------- Todos los usuarios en línea ---------- */
        socket.on('usersonline', users => {
            // Se busca si el usuario actual viene dentro de los usuarios conectados
            let index = users.findIndex( usr => usr.nick === this.nick);
            if(index !== -1) {
                // Se quita del arreglo cuando venga
                users.splice(index, 1);
            }
            this.users = users;
        });
        /* ----- Cerrar sesiones abiertas en otras pestañas ----- */
        socket.on('closesession', user => {
            // Comprobar si quien cerró sesión fue el mismo usuario en otra pestaña
            if(user === this.nick) {
                setTimeout( () => {
                    M.Modal.getInstance(document.querySelector('#userLogOut')).open();
                }, 2000);
            }
        })
        /* ------------------ Respuesta de reto ------------------ */
        socket.on('challengeresponse', info => {
            // Cuando responden el reto
            if(info.from === this.nick) {
                // Comprobar si el reto fue respondido
                if(info.response) {
                    // Se verifica si se aceptó para dirigir al combate
                    if(info.path) {
                        socket.emit('startgame', {
                            p1: {nick: info.to, status: 1},
                            p2: {nick: info.from, status: 1},
                            path: info.path
                        }); 
                        socket.emit('updateusers', [this.nick, info.to]);   
                        localStorage.setItem('nick', this.nick);
                        if (localStorage.getItem('infoGame')) {
                            localStorage.removeItem('infoGame');
                        }
                        window.location.href = info.path;
                    } else {
                        // Volver activo el botón de reto
                        this.bind.waitResponse = false;
                        // Mensaje de respuesta de rechazo
                        swal({
                            icon: 'error',
                            text: `${info.to.toUpperCase()} ha rechazado tu reto`,
                            buttons: false,
                            timer: 2500
                        });
                    }    
                } else {
                    // Volver activo el botón de reto
                    this.bind.waitResponse = false;
                    // Mensaje de respuesta de rechazo
                    if(!this.challengeCanceled) {
                        swal({
                            icon: 'error',
                            text: `${info.to.toUpperCase()} no respondido tu reto`,
                            buttons: false,
                            timer: 2500
                        });
                    }
                }                
            }
        })
        /* ----------- Reto entrante ------------- */
        socket.on('challenge', info => {
            // Comprobar si el reto es para el usuario actual
            if(info.from === this.nick) {
                // Si lo es se muestra una alerta pidiendo aceptar o rechazar
                swal({
                    title: 'Reto entrante',
                    icon:'info',
                    content: {
                        element: 'p',
                        attributes: {
                            textContent: `¡${info.to.toUpperCase()} te está retando!`
                        }
                    },
                    buttons: {
                        ok: {
                            text: 'Aceptar',
                            value: true,
                            className: 'btn-small green lighten-1'
                        },
                        no: {
                            text: 'Rechazar',
                            value: false,
                            className: 'btn-small red lighten-1'
                        },
                    },
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                    timer: 15000
                })
                .then( response => {
                    switch (response) {
                        // Cuando se acepta
                        case true:
                            let date = new Date();
                            let id = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
                            let players = `${info.to}-vs-${this.nick}`;

                            info.path = `/play/${players}?id=${id}`;
                            info.response = true;
                            this.challengeResponse(info);
                            break;
                        // Cuando se rechaza
                        case false:
                            info.response = true;
                            info.path = null;
                            this.challengeResponse(info);
                            break;
                        // Cuando no se responde
                        default:
                            info.response = false;
                            info.path = null;
                            this.challengeResponse(info);
                            break;
                    }
                })
            }
        })
    },
    watch: {
        /* --------- Abre una nueva sesión de usuario ---------- */
        nick(val) {
            // Agrega el usuario actual
            socket.emit('adduser', {
                nick: this.nick,
                fight: false
            });
        },
        /* ---- Respuesta para saber si se está o no logeado ----- */
        redirectTo(val) {
            if(val === 0) {
                // Cuando no se va a redirigir
                setTimeout( () => {
                    M.Sidenav.init(document.querySelectorAll('.sidenav'));
                    M.Modal.init(document.querySelectorAll('.modal'),{dismissible:false});
                }, 100)
            }
        }
    },
    methods: {
        /* ----------- Método para cancelar un reto ----------- */
        cancelChallenge() {
            socket.emit('cancelchallenge', this.otherPlayer);
            this.bind.waitResponse = false;
            this.challengeCanceled = true;
            this.otherPlayer = '';
        },
        /* ------- Método para responder un reto ------- */
        challengeResponse(info) {
            socket.emit('challengeresponse', {
                // Quien responde
                to: this.nick,
                // A quien le responde
                from: info.to,
                // Verificar si respondió
                response: info.response,
                // Ruta (existente cuando se acepta) para el nuevo combate
                path: info.path
            })
            // Validar si el reto fue respondido y aceptado
            if (info.response && info.path) {
                // Para saber que este usuario está en combate
                this.fight = true;
                localStorage.setItem('nick', this.nick);
                if (localStorage.getItem('infoGame')) {
                    localStorage.removeItem('infoGame');
                }
                window.location.href = info.path;
            }
        },
        /* ---------------- Retar a otro jugador ----------------- */
        challenge(from) {
            this.otherPlayer = from;
            // Deshabilitar el botón de reto
            this.bind.waitResponse = true;
            this.challengeCanceled = false;
            // Emitir el evento
            socket.emit('challenge', {
                to: this.nick,
                from: from
            });
        },
        /* ------------ Cerrado total de sesión ------------ */
        closeSession(e) {
            e.preventDefault();
            M.Sidenav.getInstance(document.querySelector('#menu-side')).close();
 
            localStorage.removeItem('token');
            this.$router.push({name: 'login', params: {
                redirected: true
            }});
            socket.emit('closesession');
        }
    },
    components: {
        Sidenav,
        Spinner
    },
    props:{
        redirected: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object,
            default: null
        }
    }
}
</script>