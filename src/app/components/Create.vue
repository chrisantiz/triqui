<template>
    <div class="container">
        <!-- Insertar -->
        <div class="section card-panel">
            <div class="row">
                <div class="input-field col s6 offset-s3">
                    <input type="text" id="name" v-model="nameUser">
                    <label for="#name">Nombre</label>
                </div>
            </div>
            <div class="row">
                <div class="col s6 offset-s3">
                    <label>Tipo de usuario: </label>
                    <user-types 
                        @index="getSelectedIndex" 
                        name="showAll" 
                        :index="select.showAll" 
                        :typeUser="types">
                    </user-types>  
                </div>
            </div>

            <div class="input-field center">
                <input class="btn btn-primary" type="button" value="Insertar" @click="insert">
            </div>

            <div class="input-field">
                <p>Buscar por: </p>
                <p>
                    <label for="r1">
                        <input v-model="searchType" class="with-gap" type="radio" name="group1" id="r1" value="user_name">
                        <span>Nombre</span>
                    </label>
                </p>

                <p>
                    <label for="r2">
                        <input v-model="searchType" class="with-gap" type="radio" name="group1" id="r2" value="user_id">
                        <span>id</span>
                    </label>
                </p>
            </div>
        </div>

        <div class="section">
            <div class="input-field">
                <input id="search" :type="inputSearchType" @keyup="filterDataSearch" v-model="searchData">
                <label for="search">Buscar usuarios: </label>
            </div>
        </div>
    
        <users-table 
            @datamodal="getDataTable" 
            :users="filteredUsers" 
            :types="types"
        />

        <!-- Modal -->
        <div class="modal" id="modalUsers">
            <div class="modal-content">
                <div class="modal-header">
                    <h4>{{ modalHeaderText }} información</h4>
                </div>
                <div class="modal-body">
                    <div v-if="userToModal.name">
                        <input id="idUser" type="hidden" :value="userToModal.id">
                        <label for="#name">Nombre: </label>
                        <input id="name" type="text" v-model="userToModal.name">
                        <label for="#selectType">Tipo de usuario: </label>
                        
                        <user-types 
                            @index="getSelectedIndex" 
                            name="userEdit" 
                            :index="select.userEdit" 
                            :typeUser="types">
                        </user-types>

                    </div>
                </div>
                <div class="modal-footer">
                    <input type="button" value="Salir" class="btn modal-close">
                    <input type="button" :value="modalHeaderText" 
                    :class="setClassBtnAction" 
                    @click="action">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {modal, autocomplete, formSelect} from '../materialize';
import axios from 'axios';
export default {
    data(){
        return {
            // Data del usuario seleccionado, información pasada al modal
            userToModal: {
                id: null,
                name: null
            },
            nameUser: null,
            // id tipo de usario e item a seleccionar en el select correspondiente
            select:{
                // Select exterior
                showAll:0,
                // Select en el modal
                userEdit:0
            },
            // Todos los tipos de usarios
            types: [],
            // Todos los usarios
            users: [],
            allUsers: [],
            filteredUsers:[],
            searchData:null,
            searchType: 'user_name',
            modalHeaderText: ''
        }
    },
    mounted() {
        modal();
    },
    created() {
        this.getUsers();
        this.getTypes();
    },
    computed: {
        inputSearchType(){
            return (this.searchType === 'user_name') ? 'text' : 'number';
        },
        setClassBtnAction(){
            return this.modalHeaderText === 'Modificar' ? 'btn green' : 'btn red'
        }
    },
    methods: {
        getDataTable(name, id, index, action) {
            this.select.userEdit = index;
            // id del usuario seleccionado
            this.userToModal.id = id;
            // name 
            this.userToModal.name = name;
            this.modalHeaderText = action;
        },
        // Obtener todos los usarios y listarlos
        async getUsers(isFilter=false) {
            const {data} = await axios.get('/users');
            this.users = data;
            this.filteredUsers = data;
            if (isFilter) {
                this.filterDataSearch();
            }
        },
        filterDataSearch() {
            // Si se escribió algo muestra las coincidencias
            if (this.searchData) {
                let reg = new RegExp(`.*${this.searchData}.*`, 'i');
                var res = this.users.filter(user => {
                    // Busca por nombre
                    if (isNaN(this.searchData)) {
                        return user[this.searchType].match(reg);
                    }
                    // Busca por ID
                    return user[this.searchType] === parseInt(this.searchData);
                })
                this.filteredUsers = res;
            // Sino, muestra todos los usuarios 
            } else {
                this.filteredUsers = this.users;
            }
        },
        // Actualizar el item seleccionado en cualquiera de los dos select
        getSelectedIndex(name, index){
            this.select[name] = index;
        },
        // Insertar nuevos usuarios
        insert(){
            axios.post('/insert', {
                name: this.nameUser,
                type: this.select.showAll
            })
                .then( res => {
                    this.getUsers();
                    this.nameUser = null;
                    this.select.showAll = 0;
                    this.newUser = true;
                })
        },
        action() {
            if (this.modalHeaderText === 'Modificar') {
                this.update();
            } else if (this.modalHeaderText === 'Eliminar') {
                this.delete();
            }
        },
        async delete(){
            const res = await axios({
                url: '/delete',
                method: 'DELETE',
                data:{
                    id: this.userToModal.id
                }
            })

            if (res.status === 200) {
                   if(res.data.status === 'ok') {
                        this.getUsers(true);
                        M.toast({
                            html: `Usuario eliminado`,
                            displayLength: 1500,
                            classes: "green",
                            completeCallback(){
                                document.querySelector('.modal-close').click();
                            }
                        })
                    }
            }
        },
        // Modificar datos de un usuario en específico
        update (){
            // Si el nombre tiene más de tres letras
            if (this.userToModal.name.length  > 3) {
                axios.put('/update', {
                    // id del usario a editar
                    id: this.userToModal.id,
                    // Los nuevos datos
                    data: {
                        name: this.userToModal.name,
                        type: this.select.userEdit
                    }
                })
                .then( res => {
                    if(res.data.status === 'ok') {
                        this.getUsers(true);
                        M.toast({
                            html: `Datos modificados`,
                            displayLength: 1500,
                            classes: "green",
                            completeCallback(){
                                document.querySelector('.modal-close').click();
                            }
                        })
                        // alert('Datos modificados correctamente');
                    }
                })
            }
        },
        // Obtener los tipos de usuarios
        getTypes(){
            axios.get('/types')
                .then (res => {
                    this.types = res.data;
                })
        }
    },
    components: {
        "user-types": {
            template: `
            <div class="input-field">
                <select v-model="select" @change="other" class="browser-default">
                    <option v-if="name=='showAll'" value="0">Selecciona...</option>
                    <option
                        :key="type.id_type" 
                        v-for="type in typeUser" 
                        :value="type.id_type"
                    > 
                    {{ type.name }}
                    </option>
                </select>
            </div>
            `,
            data() {
                return {
                    // Elemento/item a seleccionar
                    select: null
                }
            },
            // Selecciona el option por defecto defino en el padre
            created(){
                this.initialIndex();
            },
            // Escucha cualquier cambio de la propiedad 'index' ocurrida en el padre
            // y emite los datos del select modificado
            watch: {
                index(val){
                    this.getIndex(val);
                } 
            },
            methods:{
                initialIndex () {
                    this.select = this.index;  
                },
                // Emite al padre la selección del option
                other(){
                    this.$emit('index', this.name, this.select);
                },
                // Cambia la selección del select actual y emite el evento al padre 
                getIndex(val){
                    this.select = val;
                    this.$emit('index', this.name, val);
                },
            },
            props:['name','index','typeUser']
        },
        usersTable:{
            template:`
                  <div class="section">
                    <div class="row">
                        <div class="col s10 offset-s1"> 
                            <table>
                                <thead>
                                    <th>ID</th>
                                    <th>NAME</th>
                                    <th>TYPE</th>
                                </thead>
                                <tbody>
                                    <tr v-for="user in users" :key="user.id">
                                        <td>{{ user.user_id }}</td>
                                        <td>{{ user.user_name }}</td>
                                        <td>{{ user.types_name }}</td>
                                        <td> 
                                            <input 
                                                type="button" 
                                                value="Modificar" 
                                                class="btn modal-trigger" data-target="modalUsers" @click="toEdit($event)">
                                        </td>
                                        <td> 
                                            <input 
                                                type="button" 
                                                value="Eliminar" 
                                                class="btn red modal-trigger" 
                                                data-target="modalUsers"
                                                @click="toEdit($event)">
                                        </td>
                                    </tr>

                                    <tr v-if="!users.length">
                                        <td colspan="5" class="center">
                                            <h4 class="red-text">Sin resultados :(</h4>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                  </div>
                `,
            props:['users','types'],
            data() {
                return {
                    name: null,
                    id:null,
                    index: null,
                    action: null
                }
            },
            methods:{
                // Pasar los datos del usario seleccionao al modal
                toEdit(e) {
                    // Obtener todas las tds del tr actual
                    const tds = e.target.parentNode.parentNode.children;
                    let idType = this.types.filter( typ => typ.name === tds[2].textContent);
                    // id del tipo de usuario e indice que estará seleccionado en el select
                    // this.select.userEdit = idType[0].id_type;
                    // id del usuario seleccionado
                    // this.userToModal.id = parseInt(tds[0].textContent);
                    // name 
                    // this.userToModal.name = tds[1].textContent;
                    
                    this.name = tds[1].textContent;
                    this.id = parseInt(tds[0].textContent);
                    this.index = idType[0].id_type;
                    this.action = e.target.value;
                    this.$emit('datamodal', this.name, this.id, this.index, this.action)
                },
            }
        }
    }
}
</script>