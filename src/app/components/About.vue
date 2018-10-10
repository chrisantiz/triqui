<template>
    <div>
        <h2>Estás en la página About</h2>
    </div>
</template>
<script>
export default {
    beforeCreate() {
        document.querySelector('.sidenav-overlay').click();
    },
    created() {
        // if(!this.socket) {
        //     this.$router.push('/home');
        // } else {
        //     this.socket.emit('about',{msg:'estás en la página about'});
        //     this.socket.on('about', msg => {
        //         console.log(msg);
        //     })
        // }
    },
    props:['socket']
}
</script>
