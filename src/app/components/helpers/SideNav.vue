<template>
    <div>
        <div class="navbar-fixed">
            <nav class="blue">
                <div class="nav-wrapper container">
                    <a href="#" class="brand-logo left">TRIQUI</a>
                    <ul class="right">
                        <li>
                            <a href="#" class="sidenav-trigger show-on-large m-0 p-0" data-target="menu-side">
                                <i class="material-icons" style="font-size:3rem;">menu</i>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
        <!-- BARRA LATERAL -->
        <ul class="sidenav" id="menu-side">
            <li>
                <div class="user-view">
                    <div class="background">
                        <img src="/images/background.png">
                    </div>
                    <div style="display:flex;justify-content:center;">
                        <i class="material-icons" style="font-size:7rem;color:#FFF;">account_circle</i>
                    </div>
                    <a href="#"><span style="padding-bottom:16px;" class="name white-text">NICK: {{ nick.toUpperCase() }}</span>
                    </a>
                </div>
            </li>
            <li>
                <a href="#modalHistory" class="modal-trigger" @click="instance">
                    <i class="material-icons">cloud</i>
                    Mis registros
                </a>
            </li>
            <li>
                <a href="#" @click="instance">
                    <i class="material-icons orange-text">grade</i>
                    {{ points }} {{ points > 1 ? 'puntos' : 'punto' }}
                </a>
            </li>
            <li>
                <a href="#" @click="closeSession($event)">
                    <i class="material-icons red-text">close</i>
                    Cerrar sesión
                </a>
            </li>
        </ul>
        <!-- FIN BARRA LATERAL -->
        <!-- MODAL -->
        <div id="modalHistory" class="modal">
            <div class="modal-content">
                <h4 class="center-align">Historial de partidas</h4>
                <table class="striped centered responsive-table">
                    <thead>
                    <tr>
                        <th>Jugadas</th>
                        <th>Ganadas</th>
                        <th>Empatadas</th>
                        <th>Perdidas</th>
                        <th>Interrumpidas</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td>{{ history.pj }}</td>
                        <td>{{ history.pg }}</td>
                        <td>{{ history.pe }}</td>
                        <td>{{ history.pp }}</td>
                        <td>{{ history.pi }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button class="btn blue modal-close waves-effect waves-light">
                    Ok
                </button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'sidenav',
    mounted() {
        M.Sidenav.init(document.querySelector('.sidenav'));
    },
    methods: {
        closeSession(e) {
            this.$emit('closesession', e);
        },
        instance() {
            const instance = M.Sidenav.getInstance(document.querySelector('.sidenav'));
            // instance.close();
        }
    },
    props: {
        nick: {
            type: String,
            default: 'Nickname'
        },
        points: {
            type: Number,
            default: 1
        },
        history: {
            type: Object,
            default: () => {
                return {
                    pj: 0,
                    pg: 0,
                    pe: 0,
                    pp: 0,
                    pi: 0
                }
            }
        }
    }
}
</script>
