/* ---------- Mostrar alerta cuando un token es inválido ---------- */
function invalidTokenAlert(next, swal, self=false) {
    swal({
        icon: 'error',
        title: '¡Token inválido!',
        text: 'No hemos podido validar tu token de seguridad, por favor intenta iniciar sesión de nuevo.',
        buttons: 'Iniciar sesión',
        closeOnClickOutside: false,
        closeOnEsc: false
    }).then(action => {
        if (action) {
            /* Eliminar token de seguridad */
            localStorage.removeItem('token');
            /* Redirigir al login */
            if (!self) {
                next({ name: 'login', params: { redirected: true } });
            } else {
                next();
            }
        }
    });
}
/* ---------- Comprobar la validez de un token ---------- */
async function authorization(axios) {
    /* Verificar si existe un token */
    if (localStorage.getItem('token')) {
        try {
            /* Comprobar si hay una ruta de una partida */
            let id = null, gameData = null;
            if (localStorage.getItem('gameData')) {
                gameData = JSON.parse(localStorage.getItem('gameData'));
                id = gameData.id;
            }
            let result = await axios.post('/api/token', { id });
            let { auth } = result.data;
            let gameStatus = result.data.status;
            /* Si hay un usuario logeado */
            if (auth.status.code === 200) {
                /* Cuando hay una partida abierta y disponible */
                if (gameStatus) {
                    // Redirigir a la página donde se está jugando
                    return {
                        entry: true,
                        status: auth.status.code,
                        gameData,
                        data: auth.data
                    };
                } else {
                    /* Cargar la página principal del usuario */
                    return {
                        entry: true,
                        status: auth.status.code,
                        gameData: null,
                        data: auth.data
                    };
                }
            } else {
                return {
                    entry: false,
                    status: auth.status.code,
                    gameData: null,
                    data: null
                };
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
        /* Si no, se carga la página con normalidad */
    } else {
        return {
            entry: false,
            gameData: null,
            data: null
        };
    }
}

async function processAuthorization(axios, to, next) {
    try {
        const res = await authorization(axios);
        /* Si hay un usuario logeado */
        if (res.entry) {
            /* Comprobar si hay una partida activa */
            if (res.idGame) {
                /* Si se quiere entrar a una partida activa desde la url */
                window.location.href = idGame;
                // return next({
                //     name: 'play',
                //     params: {
                //         p1: to.params.p1,
                //         p2: to.params.p2,
                //         data: JSON.parse(userData),
                //         redirected: true
                //     },
                //     query: {
                //         id: to.query.id
                //     }
                // });
            } else {
                next({
                    name: 'home',
                    params: {
                        data: res.data,
                        redirected: true
                    }
                });
            }
        } else {
            /* Cuando el token es inválido */
            if (res.status === 401) {
                invalidTokenAlert(next);
            } else {
                /* Cuando solo no está logeado, renderizar la vista */
                next({
                    name: 'login'
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
}
export {
    invalidTokenAlert,
    authorization
}