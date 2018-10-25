<template>
    <div>
        <div class="navbar-fixed">
            <nav class="blue">
                <div class="nav-wrapper container">
                    <a href="#" class="brand-logo left">TRIKI</a>
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
                <a href="#" @click="instance">
                    <i class="material-icons">cloud</i>
                    Mis registros
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
    </div>
</template>
<script>
export default {
    name: 'sidenav',
    methods: {
        closeSession(e) {
            this.$emit('closesession', e);
        },
        instance() {
            const instance = M.Sidenav.getInstance(document.querySelectorAll('.sidenav'));
            instance.close();
        }
    },
    props: {
        nick: {
            type: String,
            default: 'Nickname'
        }
    }
}
</script>
