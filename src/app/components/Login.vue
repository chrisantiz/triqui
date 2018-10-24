<template>
    <!-- Cargar solo cuando no se vaya a redireccionar a otra página -->
    <div v-if="redirectTo === 0 || redirected" class="container" @keypress.enter="sendEnter">
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
                                <input type="text" id="username" v-model="username">
                                <label>Nombre de usuario</label>
                            </div>
                            <div class="input-field">
                                <input type="password" id="pass" v-model="pass">
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
                                <input type="text"
                                    id="newUsername"
                                    v-model="newUsername"
                                    @keyup="validateUser">
                                    <show-icon v-if="newUsername.length >= 3 && !userExists" icon="check" class="green-text" />
                                    <show-icon v-else-if="newUsername.length >= 3 && userExists" icon="error" class="red-text" />
                                <label>Nombre de usuario</label>
                            </div>
                            <div class="input-field">
                                <input type="password" id="newPass" v-model="newPass">
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
            /* Validar nick */
            lastTypingTime: 0,
            userExists: false,
            /* Indica si se tiene que renderizar la vista actual */
            redirectTo: null
        }
    },
    async created() {
        // Cuando no ha sido redireccionado desde otra página
        if(!this.redirected) {
            /* URL de una partida si la hay */
            let url = (localStorage.getItem('path'))
                    ? localStorage.getItem('path')
                    : null;
            /* Verificar si existe un token en el localStorage */
            if(localStorage.getItem('token')) {
                try {
                    let result = await this.axios({
                        method: 'POST',
                        url: '/api/token',
                        data: {
                            path: url
                        },
                        headers: {
                            auth: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    /* Información sobre la autenticación del token */
                    let { auth } = result.data;
                    let status = null;
                    if (url) status = result.data.status;
                     // Si hay algún usuario logeado
                    if(auth.status.code === 200) {
                        /* Cuando tiene un juego abierto y disponible */
                        if(status === 1) {
                            window.location.href = url;
                        } else {
                            /* Indica que no renderize ese componente */
                            this.redirectTo = 1;
                            // Redirige a la página home con los datos del usuario
                            this.$router.push({name:'home', params:{
                                redirected: true,
                                data: auth.data
                            }});
                        }
                    } else {
                        /* No hay usuario logeado, carga la página normalmente */
                        this.redirectTo = 0;
                    }
                } catch (err) {
                    M.toast({
                        html: '¡Error interno!, no se ha podido verificar el token',
                        displayLength: 2500,
                        className: 'red'
                    })
                }
            } else {
                // Carga la página con normalidad
                this.redirectTo = 0;
            }
        }
    },
    mounted() {
        M.Collapsible.init(document.querySelectorAll('.collapsible'));
        document.querySelector('#username').focus();
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
    methods: {
        /* ----- Ejecutar acciones cuando se presione la tecla enter ----- */
        sendEnter() {
            let login = document.querySelector('#login'),
                register = document.querySelector('#register');
            /* Cuando esté en el formulario «Login» */
            if (login.parentNode.className === 'active') {
                this.login();
            }
            /* Cuando esté en el formulario «Register» */
            if (register.parentNode.className === 'active') {
                this.register();
            }
        },
        /* --------- Método para inicar sesión --------- */
        async login(){
            /* Cuando no se ha escrito el nick */
            if (!this.username) {
                return M.toast({
                    html: 'El campo «nombre de usuario» es obligatorio',
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Cuando el nick tiene menos de 3 carácteres */
            if (this.username.length < 3) {
                return M.toast({
                    html: 'El nick debe tener por lo menos 3 dígitos',
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Cuando no se ha escrito la contraseña */
            if (!this.pass) {
                return M.toast({
                    html: 'El campo «contraseña» es obligatorio',
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Si se cumplen todas las condiciones, ejecuta la consulta */
            try {
                let result = await this.axios.post('/api/login', {
                    nick: this.username,
                    pass: this.pass
                });
                let { data } = result;
                /* Cuando las credenciales son correctas */
                if (data.status === 200) {
                    // Crea un item en el storage con el token
                    localStorage.setItem('token', result.data.token);
                    // Redirige con los datos del usuario
                    this.$router.push({name:'home', params:{
                            data: result.data,
                            redirected: true
                        }
                    });
                /* Datos incorrectos */
                } else {
                    M.toast({
                        html: `Error, credenciales incorrectas`,
                        displayLength: 1500,
                        classes: "red"
                    });
                }
            } catch (err) {
                M.toast({
                    html: `Error interno, no se ha podido verificar tu información`,
                    displayLength: 1500,
                    classes: "red"
                });
            }
        },
        /* ----------- Método para registrar un nuevo usuario ---------- */
        async register() {
            /* Cuando no se ha escrito el nick */
            if (!this.newUsername) {
                return M.toast({
                    html: 'El campo «nombre de usuario» es obligatorio',
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Cuando el nuevo nick tiene menos de tres carácteres */
            if (this.newUsername.length < 3) {
                return M.toast({
                    html: 'Su nuevo nick debe tener por lo menos 3 dígitos',
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Si no se ha escrito la contraseña */
            if (!this.newPass) {
                return M.toast({
                    html: 'El campo «contraseña» es obligatorio',
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Cuando el nuevo usuario a crear ya existe */
            if (this.userExists) {
                document.querySelector('#newUsername').focus();
                return M.toast({
                    html: `El nick «${this.newUsername}» ya existe`,
                    displayLength: 2000,
                    classes: 'red'
                });
            }
            /* Si se cumplen las condiciones, ejecuta la consulta */
            try {
                let result = await this.axios.post('/api/insert', {
                    data: { nick: this.newUsername, pass: this.newPass }
                });
                /* Cuando se ha creado el nuevo usuario */
                if (result.data.status === 201) {
                    M.toast({
                        html: `<h6>Usuario <b>${ this.newUsername }</b> creado, ya puedes logearte</h6>`,
                        displayLength: 2000,
                        classes: "green"
                    });
                    setTimeout( () => {
                        document.querySelector('#login').click();
                    }, 1000)
                } else {
                    M.toast({
                        html: `Error, usuario no creado`,
                        displayLength: 2000,
                        classes: "red"
                    });
                }
            } catch (err) {
                /* Error interno */
                M.toast({
                    html: `Error interno, usuario no creado`,
                    displayLength: 2000,
                    classes: "red"
                });
            }
        },
        /* ----------- Limpiar inputs ----------- */
        reset(e) {
            const input = e.target.id;
            if (input === 'login') {
                setTimeout( () => {
                    document.querySelector('#username').focus();
                }, 300);
                this.newUsername = '';
                this.newPass = '';
            } else {
                setTimeout( () => {
                    document.querySelector('#newUsername').focus();
                }, 300);
                this.username = '';
                this.pass = '';
            }
        },
        /* ---- Comprobar que el nick que se escribe no esté registrado ---- */
        async validateUser() {
            // Mientras se esté escribiendo
            if (this.newUsername) {
                // Tiempo desde la última tecla presionada
                this.lastTypingTime = (new Date()).getTime();
                setTimeout( async () => {
                    // Tiempo actual
                    let typingTimer = (new Date()).getTime();
                    // Tiempo trascurrido entre ambos
                    let timeDiff = typingTimer - this.lastTypingTime;
                    // Si el tiempo trascurrido supera los 400ms ejecuta
                    if (timeDiff >= 400) {
                        try {
                            let result = await this.axios.post('/api/validate', {
                                username: this.newUsername
                            });
                            this.userExists = result.data.exists;
                        } catch (err) {
                            console.log(err);
                        }
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