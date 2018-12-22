<template>
    <div>
        <!-- RENDERIZAR COMPONENTE BARRA SUPERIOR Y LATERAL -->
        <sidenav :nick="userData.nick" :points="points" :history="history" @closesession="closeSession" />
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
/* Socket.io */
import io from 'socket.io-client';
import { socket, PORT } from '../../server/keys'
// Alertas
import swal from 'sweetalert';
import Vue from 'vue';
import { authorization, invalidTokenAlert } from '../router/functions';
import { Promise } from 'q';
export default {
    async beforeRouteEnter(to, from, next) {
        if (to.params.redirected) {
            next(mv => {
                mv.userData = mv.$props.data
            });
        } else {
            try {
                let res = await authorization(Vue.axios);
                /* Logeado */
                if (res.entry) {
                    /* Cuando hay una partida activa */
                    if (res.gameData) {
                        return next({
                            name: 'play',
                            params: {
                                p1: res.gameData.p1,
                                p2: res.gameData.p2,
                                data: res.data,
                                redirected: true
                            },
                            query: {
                                id: res.gameData.id
                            }
                        });
                    }
                    /* Renderizar el component actual y pasar los datos del usuario */
                    next( mv => {
                        mv.userData = res.data;
                    });
                } else {
                    /* Cuando el token es inválido */
                    if (res.status === 401) {
                        return invalidTokenAlert(next, swal);
                    }
                    /* Cuando solo no está logeado, renderizar la vista */
                    next({ name: 'login', params: { redirected: true } });
                }
            } catch(err) {
                swal({
                    icon: 'error',
                    title: '¡Error interno!',
                    text: 'Tenemos problemas al obtener tu información, por favor intenta volver a iniciar sesión.',
                    buttons: 'Iniciar sesión',
                    closeOnClickOutside: false,
                    closeOnEsc: false
                }).then( action => {
                    localStorage.removeItem('token');
                    next({ name: 'login' });
                });
            }

        }
    },
    data() {
        return {
            /* Datos del usuario actual */
            userData: {},
            socket: io.connect(`${socket.URI}:${PORT}/home`),
            /* Historial de las partidas jugadas */
            history: {},
            /* Puntos del usuario */
            points: null,
            /* Identificador de la sala donde jugarán */
            romm: '',
            // Usuarios en línea
            users: [],
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
    mounted() {
        M.Modal.init(document.querySelector('.modal'));
    },
    async created() {
        // if(!this.redirected) {
        //     // Comprobar si hay un token en el local storage
        //     if(localStorage.getItem('token')) {
        //         let url = (localStorage.getItem('path'))
        //                 ? localStorage.getItem('path')
        //                 : null;
        //         try {
        //             let result = await this.axios.post('/api/token', { path: url });
        //             /* Datos de sesión */
        //             let { auth } = result.data;
        //             let status = null;
        //             /* Información sobre alguna partida activa */
        //             if (url) status = result.data.status;
        //             /* Respuesta de verificación del token */
        //             switch (auth.status.code) {
        //                 /* Correcto */
        //                 case 200:
        //                     /* Cuando tiene un juego abierto y disponible */
        //                     if(status === 1) {
        //                         this.redirectTo = 1;
        //                         window.location.href = url;
        //                     /* Si no, se deja en la página */
        //                     } else {
        //                         /* Los datos del usuario */
        //                         this.redirectTo = 0;
        //                         this.userData = auth.data;
        //                     }
        //                 break;
        //                 /* Token expirado */
        //                 case 401:
        //                     /* Impedir renderizar el componente */
        //                     this.redirectTo = 1;
                            // swal({
                            //     icon: 'error',
                            //     title: '¡Token expirado!',
                            //     text: 'Tu sesión ha caducado, por favor vuelve a iniciar sesión.',
                            //     buttons: 'Iniciar sesión',
                            //     closeOnClickOutside: false,
                            //     closeOnEsc: false
                            // }).then( action => {
                            //     if (action) {
                            //         /* Eliminar token de seguridad */
                            //         localStorage.removeItem('token');
                            //         /* Redirigir al login */
                            //         this.$router.push({ name: 'login',
                            //             params: { redirected: true }
                            //         });
                            //     }
                            // });
        //                 break;
        //                 /* Token inválido */
        //                 default:
        //                     /* Impedir renderizar el componente */
        //                     this.redirectTo = 1;
        //                     swal({
        //                         icon: 'error',
        //                         title: '¡Token inválido!',
        //                         text: 'El token verificado es incorrecto, por favor vuelve a iniciar sesión.',
        //                         buttons: 'Iniciar sesión',
        //                         closeOnClickOutside: false,
        //                         closeOnEsc: false
        //                     }).then( action => {
        //                         if (action) {
        //                             /* Eliminar token de seguridad */
        //                             localStorage.removeItem('token');
        //                             /* Redirigir al login */
        //                             this.$router.push({ name: 'login',
        //                                 params: { redirected: true }
        //                             });
        //                         }
        //                     });
        //                 break;
        //             }
        //         } catch (err) {
        //             /* Si ocurre un error al intentar verificar el token */
        //             swal({
        //                 icon: 'error',
        //                 title: '¡Token no validado!',
        //                 text: 'Error inesperado, no hemos podido verificar tu token de seguridad. Intenta volver a iniciar sesión.',
        //                 buttons: 'Iniciar Sesión'
        //             }).then( action => {
        //                 /* Impedir renderizar el componente */
        //                 this.redirectTo = 1;
        //                 /* Eliminar el token de seguridad actual */
        //                 localStorage.removeItem('token');
        //                 /* Redirigir al login */
        //                 this.$router.push({ name: 'login' });
        //             });
        //         }
        //     } else {
        //         // Si no hay ningún token se manda al login
        //         this.redirectTo = 1;
        //         this.$router.push({ name:'login' });
        //     }
        // } else {
        //     /* -------- Cuando se he redirigido desde el login ------ */
        //     /* Datos del usuario */
        //     this.userData = this.data;
        //     this.redirectTo = 0;
        // }
        /* --------- Evento para cancelar un reto -------- */
        this.socket.on('cancelchallenge', user => {
            if (this.userData.nick === user) {
                this.challengeCanceled = true;
                swal.close();
            }
        });
        /* ---------- Todos los usuarios en línea ---------- */
        this.socket.on('usersonline', users => {
            // Se busca si el usuario actual viene dentro de los usuarios conectados
            let index = users.findIndex( usr => usr.nick === this.userData.nick);
            if(index !== -1) {
                // Se quita del arreglo cuando venga
                users.splice(index, 1);
            }
            this.users = users;
        });
        /* ----- Cerrar sesiones abiertas en otras pestañas ----- */
        this.socket.on('closesession', user => {
            // Comprobar si quien cerró sesión fue el mismo usuario en otra pestaña
            if(user === this.userData.nick) {
                setTimeout( () => {
                    M.Modal.getInstance(document.querySelector('#userLogOut')).open();
                }, 2000);
            }
        })
        /* ------------------ Respuesta de reto ------------------ */
        this.socket.on('challengeresponse', info => {
            // Cuando responden el reto
            if(info.p1 === this.userData.nick) {
                // Comprobar si el reto fue respondido
                if(info.response) {
                    // Se verifica si se aceptó para dirigir al combate
                    if(info.accept) {
                        this.socket.emit('startgame', {
                            p1: { nick: info.p1, status: 1 },
                            p2: { nick: info.p2, status: 1 },
                            id: info.id
                        });
                        this.socket.emit('updateusers', [info.p1, info.p2]);
                        /* Guardar datos localmente para su uso en Play.vue */
                        localStorage.setItem('userData', JSON.stringify(this.userData));
                        if (localStorage.getItem('infoGame')) {
                            localStorage.removeItem('infoGame');
                        }
                        this.$router.push({
                            name: 'play',
                            params: {
                                p1: info.p1,
                                p2: info.p2,
                                data: this.userData,
                                redirected: true
                            },
                            query: {
                                id: info.id
                            }
                        });
                        // window.location.href = info.path;
                    } else {
                        // Volver activo el botón de reto
                        this.bind.waitResponse = false;
                        // Mensaje de respuesta de rechazo
                        swal({
                            icon: 'error',
                            text: `${info.p2.toUpperCase()} ha rechazado tu reto`,
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
                            text: `${info.p2.toUpperCase()} no respondido tu reto`,
                            buttons: false,
                            timer: 2500
                        });
                    }
                }
            }
        })
        /* ----------- Reto entrante ------------- */
        this.socket.on('challenge', info => {
            // Comprobar si el reto es para el usuario actual
            if(info.to === this.userData.nick) {
                // Si lo es se muestra una alerta pidiendo aceptar o rechazar
                swal({
                    title: 'Reto entrante',
                    icon:'info',
                    content: {
                        element: 'p',
                        attributes: {
                            textContent: `¡${info.from.toUpperCase()} te está retando!`
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
                            let players = `${info.to}-vs-${this.userData.nick}`;

                            info.path = `/play/${players}?id=${id}`;
                            info.response = true;

                            this.room = `/play/${players}?id=${id}`;
                            // this.challengeResponse(info);
                            /* ---------------------------------- */
                            this.challengeResponse({
                                response: true,
                                accept: true,
                                p1: info.from,
                                p2: info.to,
                                id
                            });
                            break;
                        // Cuando se rechaza
                        case false:
                            info.response = true;
                            info.path = null;
                            // this.challengeResponse(info);
                            /* ------------------- */
                            this.challengeResponse({
                                response: true,
                                accept: false,
                                p1: info.from,
                                p2: info.to
                            });
                            break;
                        // Cuando no se responde
                        default:
                            info.response = false;
                            info.path = null;
                            // this.challengeResponse(info);
                            /* ------------------- */
                            this.challengeResponse({
                                response: false,
                                accept: false,
                                p1: info.from,
                                p2: info.to
                            });
                            break;
                    }
                })
            }
        })
    },
    watch: {
        /* --------- Abre una nueva sesión de usuario ---------- */
        async userData(val) {
            /* Consultar los puntos actuales del jugador */
            try {
                const { id } = this.userData;

                const resPoints = this.axios.get(`/api/points/${id}`);
                const resHistory = this.axios.get(`/api/history/${id}`);

                const result = await Promise.all([resPoints, resHistory]);

                const points = result[0].data;
                const history = result[1].data;

                if (points.status === 200 && history.status === 200) {
                    this.points = points.data.points;
                    this.history = history.data;
                } else {
                    M.toast({
                        html: `<p>¡Error!</p> Lo sentimos, no pudimos obtener el historial de tu cuenta.`,
                        displayLength: 2500,
                        classes: 'red'
                    });
                }
                console.log('Los puntos', points);
                console.log('El historial', history);
            } catch (err) {
                M.toast({
                    html: `<p>¡Error!</p> Lo sentimos, no pudimos obtener el historial de tu cuenta.`,
                    displayLength: 2500,
                    classes: 'red'
                });
            }
            // Agrega el usuario actual
            this.socket.emit('adduser', {
                nick: this.userData.nick,
                fight: false
            });
        }
    },
    methods: {
        /* ----------- Método para cancelar un reto ----------- */
        cancelChallenge() {
            this.socket.emit('cancelchallenge', this.otherPlayer);
            this.bind.waitResponse = false;
            this.challengeCanceled = true;
            this.otherPlayer = '';
        },
        /* ------- Método para responder un reto ------- */
        challengeResponse(info) {
            // this.socket.emit('challengeresponse', {
            //     // Quien responde
            //     to: this.userData.nick,
            //     // A quien le responde
            //     from: info.to,
            //     // Verificar si respondió
            //     response: info.response,
            //     // Ruta (existente cuando se acepta) para el nuevo combate
            //     path: info.path
            // });
            /* ------------------------ */
            this.socket.emit('challengeresponse', info);
            // Validar si el reto fue respondido y aceptado
            if (info.response && info.accept) {
                // Para saber que este usuario está en combate
                this.fight = true;
                /* Guardar en localStorage para su uso en Play.vue */
                // localStorage.setItem('userData', JSON.stringify(this.userData));
                // if (localStorage.getItem('infoGame')) {
                //     localStorage.removeItem('infoGame');
                // }
                // window.location.href = info.path;
                /* Redireccionar a la partida */
                this.$router.push({
                    name: 'play',
                    params: {
                        p1: info.p1,
                        p2: info.p2,
                        data: this.userData,
                        redirected: true
                    },
                    query: {
                        id: info.id
                    }
                });
            }
        },
        /* ---------------- Retar a otro jugador ----------------- */
        challenge(to) {
            this.otherPlayer = to;
            // Deshabilitar el botón de reto
            this.bind.waitResponse = true;
            this.challengeCanceled = false;
            // Emitir el evento
            this.socket.emit('challenge', {
                to,
                from: this.userData.nick,
            });
        },
        /* ------------ Cerrado total de sesión ------------ */
        closeSession(e) {
            e.preventDefault();
            M.Sidenav.getInstance(document.querySelector('#menu-side')).close();

            localStorage.removeItem('token');
            this.socket.emit('closesession');
            this.$router.push({ name: 'login', params: { redirected: true } });
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
        },
    }
}
</script>