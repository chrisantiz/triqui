<template>
    <!-- Cargar solo cuando no se vaya a redireccionar a otra página -->
    <div v-if="redirectTo === 0 || redirected" class="container">
        <h2 class="center">Triki</h2>
        <!-- Fila principar -->
        <div class="row">
            <!-- Columna acordeón -->
            <div class="col s12 m8 l6 push-l3 push-m2">
                <ul class="collapsible" data-collapsible="accordion">
                    
                    <!-- Zona login -->
                    <li class="active">
                        <!-- Cabecera -->
                        <div class="collapsible-header blue white-text" id="login" @click="reset($event)">
                            Iniciar Sesión
                        </div>
                        <!-- Cuerpo --> 
                        <div class="collapsible-body">
                            <div class="input-field">
                                <input type="text" v-model="username">
                                <label>Nombre de usuario</label>
                            </div>
                            <div class="input-field">
                                <input type="password" v-model="pass">
                                <label>Contraseña</label>
                            </div>
                            <button class="btn green lighten-1" @click="login">
                                Iniciar Sesión
                            </button>
                        </div>
                        <!-- Fin cuerpo -->
                    </li>
                    <!-- Fin zona login -->

                    <!-- Zona registrar -->
                    <li>
                        <!-- Cabecera -->
                        <div class="collapsible-header blue white-text" id="register" @click="reset($event)">
                            Registrarme
                        </div> 
                        <!-- Cuerpo -->
                        <div class="collapsible-body">
                            <div class="input-field show-status-icons">
                                <input type="text" v-model="newUsername" @keyup="validateUser">
                              
                                    <show-icon v-if="newUsername && !userExists" icon="check" class="green-text" />
                                    <show-icon v-else-if="newUsername && userExists" icon="error" class="red-text" />
                               
                                <label>Nombre de usuario</label>
                            </div>
                            <div class="input-field">
                                <input type="password" v-model="newPass">
                                <label>Contraseña</label>
                            </div>
                            <div class="input-field">
                                <button class="btn green lighten-1" @click="register">
                                    Registrarme
                                </button>
                            </div>
                        </div>
                        <!-- Fin cuerpo -->
                    </li>
                    <!-- Fin zona registrar -->
                </ul>
            </div>
            <!-- Fin columna acordeón -->
        </div>
        <!-- Fin fila principal -->
        <!-- <pre>{{$data}}</pre> -->
    </div>

</template>
<script>

export default {
    data() {
        return {
            /* LOGIN */
            username: '',
            pass: '',
            /* REGISTRAR */
            newUsername: '',
            newPass: '',
            // Validar nick
            lastTypingTime: 0,
            userExists: false,
        
            userActual: '',
            redirectTo: null
        }
    },
    created() {
        // Cuando no ha sido redireccionado desde otra página
        if(!this.redirected) {
            let url = (localStorage.getItem('path'))
                    ? localStorage.getItem('path')
                    : null;
            if(localStorage.getItem('token')) {
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
                    let { auth } = data;
                    let status = null;

                    if (url) status = data.status;
                    // Si hay algún usuario logeado
                    if(auth.status.code === 200) {
                        /* Cuando tiene un juego abierto y disponible */
                        if(status === 1) {
                            window.location.href = url;
                        } else {
                            this.redirectTo = 1;
                            // Redirige a la página home con los datos del usuario
                            this.$router.push({name:'home', params:{
                                redirected: true,
                                data: auth.data
                            }});
                        }
                    } else {
                        // Carga la página con normalidad
                        this.redirectTo = 0;
                    }
                })
                .catch(err => console.log(err))
            } else {
                // Carga la página con normalidad
                this.redirectTo = 0;
            }
        }
    },
    mounted() {
        M.Collapsible.init(document.querySelectorAll('.collapsible'));
    },
    watch: {
        // Espera para saber si se va a direccionar a otra página
        redirectTo(val) {
            // Cuando se queda en la página
            if (val === 0) {
                // Espera a que se cree el nodo
                setTimeout( () => {
                    M.Collapsible.init(document.querySelectorAll('.collapsible'));
                }, 50)
            }
        }
    },
    methods:{
        /* --------- Método para inicar sesión --------- */
        login(){
            if (this.username.length>=3 && this.pass) {
                this.axios.post('/api/login', {
                    nick: this.username,
                    pass: this.pass
                })
                .then(res => {
                    // Si las credenciales son correctas
                    if(res.data){
                        // Crea un item en el storage con el token
                        localStorage.setItem('token', res.data.token);
                        // Redirige con los datos del usuario
                        this.$router.push({name:'home', params:{
                                data: res.data,
                                redirected: true
                            }
                        });
                    }
                })
            }
        },
        /* ----------- Método para registrar un nuevo usuario ---------- */
        register() {
            this.axios.post('/api/insert', {
                data: {
                    nick: this.newUsername,
                    pass: this.newPass
                }
            })
            .then(res => res.data)
            .then(data => {
                if (data.status === 'ok') {
                    M.toast({
                        html: `<h5>Usuario <b>${ this.newUsername }</b> creado</h5>`,
                        displayLength: 1500,
                        classes: "green"
                    })
                    this.newUsername = '';
                    this.newPass = '';
                } else {
                    M.toast({
                        html: `Error, usuario no creado`,
                        displayLength: 1500,
                        classes: "red"
                    })
                }
            })
        },
        /* ----------- Limpiar inputs ----------- */
        reset(e) {
            const input = e.target.id;
            if (input === 'login') {
                this.newUsername = '';
                this.newPass = '';
            } else {
                this.username = '';
                this.pass = '';
            }
        },
        /* ---- Comprobar que el nick que se escribe no esté registrado ---- */
        validateUser() {
            // Mientras se esté escribiendo
            if (this.newUsername) {
                // Tiempo desde la última tecla presionada
                this.lastTypingTime = (new Date()).getTime();
                setTimeout( () => {
                    // Tiempo actual
                    let typingTimer = (new Date()).getTime();
                    // Tiempo trascurrido entre ambos
                    let timeDiff = typingTimer - this.lastTypingTime;
                    // Si el tiempo trascurrido supera los 400ms ejecuta
                    if (timeDiff >= 400) {
                        this.axios.post('/api/validate', {
                            username: this.newUsername
                        })
                            .then(res => res.data)
                            .then(data => {
                                this.userExists = data.exists;
                            })
                            .catch( err => console.log(err))
                    }
                }, 400)
            } else {
                this.lastTypingTime = 400;
            }
        }
    },
    components: {
        showIcon: {
            template: `
            <transition name="fade" mode="out-in">
                <i class="material-icons">{{ icon }}</i>
            </transition>`,
            props: ['icon']
        }
    },
    props: {
        redirected: {
            type: Boolean,
            default: false
        }
    }
}
</script>