<template>
    <!-- <div> -->
    <div v-if="redirectTo === 0">
      <!-- COMPONENTE BARRA LATERAL Y SUPERIOR-->
      <sidenav :nick="userData.nick" @closesession="closeTotalSession" />
      <transition name="fade" mode="out-in">
        <!-- Mostrarse solo cuando el rival se haya ido estando en batalla -->
        <div v-if="rivalState === 0 && active && !timeout && !forceLeft" class="spinner">
          <div class="wrapper-spinner">
              <Spinner size="big" />
              <h2>{{time}}</h2>
              <h5>Tu rival se ha ido, esperando...</h5>
          </div>
        </div>
      </transition>

      <div class="container mt-2-m-and-up">
          <div class="row hoverable card-panel pt-0-5-on-small-only pb-1-on-small-only">
            <!-- Columna del local -->
            <div class="col s6 m3 l3">
                <div class="left-align">
                    <span class="flow-text hide-on-small-only">LOCAL</span>
                    <!-- Nick del jugador local -->
                    <div class="flow-text d-flex h-40px align-items-center" >
                        <i class="material-icons red-text mr-0-5">close</i>
                        {{ p1 === userData.nick ? 'yo' : p1 }}
                    </div>
                    <!-- Ícono que se mostrará cuando el turno sea para el visitante -->
                    <transition name="fade">
                      <div v-show="playerTurn === p1"
                      class="my-turn">
                        <!-- Mensaje de ayuda al hacer hover sobre el ícono -->
                        <i class="material-icons tooltipped"
                        data-position="bottom"
                        :data-tooltip="p1===userData.nick ? 'Es tu turno': 'Turno para ' + rivalNick"
                        >touch_app</i>
                      </div>
                    </transition>
                </div>
            </div>
            <!-- Fin columna loca -->
            <!-- Columna visitante -->
            <div class="col s6 m3 l3 push-m6 push-l6">
                <div class="right-align">
                    <span class="flow-text hide-on-small-only">VISITA</span>
                    <!-- Nick del jugador visitante -->
                      <div class="flow-text d-flex h-40px align-items-center jc-end" >
                        {{ p2 === userData.nick ? 'yo' : p2 }}
                        <i class="material-icons blue-text ml-0-5">panorama_fish_eye</i>
                    </div>
                    <!-- Ícono que se mostrará cuando el turno sea para el visitante -->
                    <transition name="fade">
                      <div v-show="playerTurn === p2" class="my-turn">
                        <!-- Mensaje de ayuda al hacer hover sobre el ícono -->
                        <i class="material-icons tooltipped"
                        data-position="bottom"
                        :data-tooltip="p2===userData.nick ? 'Es tu turno': 'Turno para ' + rivalNick">
                        touch_app</i>
                      </div>
                    </transition>
                </div>
            </div>
            <!-- Fin columna visitante -->
            <div class="col s12 m6 l6 pull-m3 pull-l3">
                <div class="d-flex jc-center">
                    <table-triki @getaction="getTarget" />
                </div>
            </div>
            <div class="col s12 d-flex jc-end btn-exit">
              <button class="btn-small red waves-effect waves-light" @click="closeSession">
                Abandonar
                <i class="material-icons right">close</i>
              </button>
            </div>
          </div>

      </div>
      <!-- <pre>{{$data}}</pre> -->
      <chat :user="rivalNick" :socket="socket"/>
    </div>
</template>
<script>
// Componente barra lateral y menú
import Sidenav from "./helpers/SideNav.vue";
// Spinner
import Spinner from "./helpers/Spinner.vue";
// Chat
import Chat from './Chat.vue';
// Alertas
import swal from "sweetalert";
/* Socket.io */
import io from 'socket.io-client';
const socket = io.connect('http://127.0.0.1:3000/play');

export default {
  /* ----------------------------- VARIABLES ------------------------------- */
  data() {
    return {
      /* Conexión a socket.io para ser usada en el componente Chat */
      socket: socket,
      /* Información del usuario actual */
      userData: {},
      /* Puntos actuales del jugador */
      points: 0,
      /* Nick del rival */
      rivalNick: '',
      /* Estado de actividad del rival */
      rivalState: null,
      /* Ruta de la partida actual  */
      thisPath: '',
      /* Tiempo que esperará un usuario cuando el otro se va en una partida activa */
      time: 10,
      /* Indica si se tiene que redirigir a otra página o renderizar la actual */
      redirectTo: null,
      /* Número del turno actual, solo se podrán 9 */
      turn: 0,
      /* Usario al que le corresponde el turno actual */
      playerTurn: null,
      /* Guarda las posiciones donde se da click para saber si algún jugador ha ganado */
      arrTriki: new Array(9),
      /* Celdas donde los usuarios darán click */
      cells: document.getElementsByClassName("div-td"),
      /* Indica si alguien ha gando */
      winner: false,
      /* La combinación de posiciones en la que un jugador ha ganado */
      comb: [],
      /* Indica si el rival ha marcado una posición para marcarla también en la actual */
      auto: false,
      /* Símbolo que dibujará el jugador actual */
      draw: '',
      /* Símbolo que dibujará el rival */
      rivalDraw: '',
      /* Saber si la partida sigue activa o no */
      active: true,
      /* Información en el localStorage sobre una partida activa */
      infoGame: {},
      /* Indica si luego de jugar una partida se echará otro */
      playAgain: true,
      /* Respuesta, sobre si volver a jugar o no, del usuario actual */
      myResponse: false,
      /* Respuesta del rival sobre si volver a jugar o no*/
      rivalResponse: false,
      /* Indica si el tiempo de espera (sobre si volver a jugar o no) se ha agotado */
      timeout: false,
      /* Cuando un usuario abandona la partida estando activa */
      forceLeft: false
    };
  },
  /* -------------------------- COMPONENTE CREADO ------------------------- */
  async created() {
    /* Preguntar si existe información de una partida activa */
    if (localStorage.getItem("infoGame")) {
      /* Preguntar si existe información de la partida */
      this.infoGame = JSON.parse(localStorage.getItem("infoGame"));
    }
    /* Por defecto el primer turno será para el local (el retador) */
    this.playerTurn = this.p1;
    // Rellenar el arreglo
    this.arrTriki.fill("-");
    // Formatear la ruta a enviar
    let path = new String(location.href);
    let pathname = location.pathname;
    let params = path.slice(path.indexOf("?"));

    if (params[params.length - 1] === "#") {
      params = params.substr(0, params.length - 2);
    }
    this.thisPath = `${pathname}${params}`;
    /* ------- CUANDO SE ENVÍA DESDE EL HOME (INICIAR UNA PARTIDA) ------- */
    if (localStorage.getItem('userData')) {
      /* Unirlo a un nuevo canal */
      socket.emit('joinroom', this.thisPath);
      /* Permite renderizar la vista actual */
      this.redirectTo = 0;
      /* Obtiene la data del usuario actual guardada localmente */
      this.userData = JSON.parse(localStorage.getItem('userData'));
      localStorage.removeItem('userData');
      /* El símbolo que pintará cada jugador */
      this.draw = this.userData.nick === this.p1 ? "X" : "O";
      // Guardar la ruta
      localStorage.setItem("path", this.thisPath);
      /* Nombre del nick del rival */
      this.rivalNick = this.p1 === this.userData.nick ? this.p2 : this.p1;
      this.rivalState = 1;
      socket.emit("entry", this.userData.nick);
    } else {
      /* ------- CUANDO SE ACCEDE A LA RUTA O ES REDIRECCIONADO ------- */
      // Comprobar si hay un token en el local storage
      if (localStorage.getItem('token')) {
        try {
            let result = await this.axios({
                method: 'POST',
                url: '/api/token',
                data: {
                    path: this.thisPath
                },
                headers: {
                    Autorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // `auth` es la data del token y `status` la validación del path
            let { status, auth } = result.data;
            /* SI HAY ALGÚN USUARIO CON SESIÓN ACTIVA */
            if (auth.status.code === 200) {
              /* CUANDO LA RUTA HA SIDO VALIDADA EXITOSAMENTE */
              if (status === 1) {
                /* Unirlo a un nuevo canal (o al que estaba si salió y volvió) */
                socket.emit('joinroom', this.thisPath);
                /* Indica que la vista actual se renderizará */
                this.redirectTo = 0;
                /* Asigna la data del usario */
                this.userData = auth.data;
                /* Asigna el nick del rival */
                this.rivalNick = this.p1 === this.userData.nick ? this.p2 : this.p1;
                /* Permite saber si el rival sigue activo en la partida */
                this.rivalState = 1;
                /* Lo que cada usuario pintará */
                this.draw = this.userData.nick === this.p1 ? "X" : "O";
                /* Guardar la ruta/sobrescribir */
                localStorage.setItem("path", this.thisPath);
                /* Emite una nueva entrada */
                socket.emit("entry", this.userData.nick);
              } else {
                /* CUANDO LA RUTA YA HA CADUCADO */
                swal({
                  icon: "warning",
                  title: "¡Partida caducada!",
                  text: "No puedes acceder a esta partida",
                  buttons: "OK"
                })
                .then(res  => this.$router.push({ name: 'home' }) );
              }
            } else {
              /* CUANDO LA SESIÓN HA EXPIRADO */
              /* Impide renderizar la vista actual */
              this.redirectTo = 1;
              /* Redirecciona a inicio */
              this.$router.push({ name: "login" });
            }
        } catch (err) {
            swal({
              icon: 'error',
              title: '¡Error interno!',
              text: 'No se ha podido verificar tu token, vuelve a intentarlo.',
              buttons: 'Ok'
            }).then( res => window.location.href = '/home');
        }
      } else {
        // Si no hay ningún token se manda al login
        this.redirectTo = 1;
        this.$router.push({ name: "login" });
      }
    }
    /* ------------------- EVENTOS SOCKET.IO ------------------- */
    /* Cuando el rival se va de la partida */
    socket.on("userlogout", () => {
        /* Cuando la partida está inactiva (esperando respuesta) y el rival se va */
        if (!this.active && !this.rivalResponse && !this.timeout) {
          /* Pathname de la página juegos `/play` */
          let pathnamePlay = new String(this.thisPath).split('/')[1];
          /* Pathname de la página actual */
          let pathnameThis = new String(location.pathname).split('/')[1];
          /* Verificar si se está en la página de juegos, solo en ella ejecutará la alerta */
          if (`/${pathnamePlay}` === `/${pathnameThis}`) {
            /* Eliminación inmediata de la sesión actual */
            socket.emit('deletepath', this.thisPath);
            this.rivalState = 2;
            /* Cerrar la alerta actual */
            swal.close();
            /* QUITARLE PUNTOS AL RIVAL Y SUMARLE AL ACTUAL */
            swal({
              icon: 'error',
              title: '¡Rival ha abandonado!',
              text: 'Tu rival se ha ido sin responder, la sesión actual será eliminada.',
              buttons: 'Ok',
            })
            .then( res => window.location.href = '/home' );
          }
        } else {
          /* Cuando la partida está activa */
          this.rivalState = 0;
        }
    });
    /* Cuando el rival se va y vuelve aún en partida activa */
    socket.on("entry", user => {
      if (this.rivalState === 0 && user === this.rivalNick) {
        this.rivalState = 1;
        setTimeout( () => {
          M.toast({
            html: `<strong class="white-text">¡Tu rival ha vuelto!</strong>`,
            classes: "green",
            displayLength: 2000
          });
        }, 800);
      }
    });
    /* Asignar el turno al rival */
    socket.on("nextturn", data => {
      /* Usuario con el turno actual */
      this.playerTurn = data.nick;
      /* Obtendrá la data siempre y cuando vaya dirigida a él */
      if (data.nick === this.userData.nick) {
        this.auto = true;
        /* Información enviada del rival */
        this.rivalDraw = {
          draw: data.draw,
          nick: data.emited
        };
        /* Dar click automáticamente en la posición establecida */
        this.cells[data.index].click();
      }
    });
    /* Cuando una partida ha finalizado */
    socket.on("again", async (data) => {
      /* Verificar si el evento es enviado para mi usuario */
      if (this.userData.nick === data.nick) {
        this.rivalResponse = true;
        /* Cuando el rival ha decidido no seguir jugando */
        if (!data.res) {
          swal.close();
          swal({
            icon: 'error',
            title: '¡No va más!',
            text: `${this.rivalNick} no quiere jugar más.`,
            buttons: 'Volver',
          }).then( res => window.location.href = '/home');

          try {
            let result = await this.axios.post('/api/points', {
              nick: this.userData.nick,
              points: 3
            });
            if (result.data.status !== 200) {
              M.toast({
                html: '¡Error!\n Lo sentimos, tus puntos no han podido ser actualizados.',
                displayLength: 2500,
                classes: 'red'
              });
            }
          } catch (err) {
            M.toast({
              html: '¡Error!\n Lo sentimos, tus puntos no han podido ser actualizados.',
              displayLength: 2500,
              classes: 'red'
            });
          }
        } else {
          /* Cuando quiere volver a jugar */
          if (this.myResponse) {
            /* Preguntar si ya yo he respondido para cerrar la alerta y empezar otra partida */
            swal.close();
            this.myResponse = false;
          }
        }
        this.active = data.res;
        this.playAgain = data.res;
      }
    });
    /* Cuando el jugador actual no respondió sobre una nueva partida */
    socket.on('timeout', nick => {
      if (nick === this.userData.nick) {
        this.timeout = true;
        swal.close();
        swal({
          icon:'error',
          title: '¡Tiempo de espera agotado!',
          text: 'Tardaste mucho en responder, la sesión actual ha finalizado.',
          buttons: 'Ok'
        })
        .then( res => window.location.href = '/home' );
      }
    });
    /* Cuando un usuario abando una partida estando activa */
    socket.on('forceleft', () => {
      this.forceLeft = true;
      swal({
        icon: 'info',
        title: '¡Rival interrumpió la partida!',
        text: `${this.rivalNick} ha decido dejar de jugar.`,
        buttons: 'Ok'
      })
      .then( action => window.location.href = '/home' );
      // setTimeout( () => {
      //   M.toast({
      //     html:`Tus nuevos puntos son: <strong>${this.points+3}</strong>`,
      //     displayLength: 2500,
      //     classes: 'green'
      //   });
      // }, 300);
    });
  },
  mounted() {
    M.Tooltip.init(document.querySelectorAll('.tooltipped'));
  },
  /* ---------------- PROPIEDADES OBSERVADORAS DE CAMBIOS ----------------- */
  watch: {
    userData(val) {
      setTimeout( () => {
        /* Si el usuario que salió fue el actual y la partida sigue activa */
        if (this.infoGame && this.infoGame.userLeft === this.userData.nick) {
          /* Se le asignan los mismos valores de variables dejados al momento de salir */
          this.arrTriki = this.infoGame.arrTriki;
          this.cells = document.getElementsByClassName("div-td");
          this.playerTurn = this.infoGame.next;
          this.turn = this.infoGame.turn;
          /* Se dibujan en el tablero los turnos ya dados */
          for (let idx in this.arrTriki) {
            if (this.arrTriki[idx] === "X" || this.arrTriki[idx] === "O") {
              /* Estilos de casilla a marcar */
              let icon = (this.arrTriki[idx] === 'X')
                      ? `<i class="material-icons red-text">close</i>`
                      : `<i class="material-icons blue-text">panorama_fish_eye</i>`;
              this.cells[idx].innerHTML = icon;
              this.cells[idx].children[0].style.fontSize = '3rem';
            }
          }
        }
      }, 100);

      setTimeout(() => {
        M.Sidenav.init(document.querySelectorAll(".sidenav"));
        M.Collapsible.init(document.querySelectorAll(".collapsible"));
      }, 50);
    },
    rivalState(val) {
      let interval;
      if (val === 0 && this.playAgain && !this.timeout && !this.forceLeft) {
        document.body.style.height = "100vh";
        document.body.style.overflow = "hidden";
        setTimeout(() => {
          document.querySelector(".wrapper-spinner").classList.toggle("anime");
        }, 600);

        setTimeout(() => {
          interval = setInterval(() => {
            this.time--;
            /* Esperar cierta cantidad de tiempo */
            if (this.time < 1) {
              clearInterval(interval);
              document.querySelector(".wrapper-spinner").style.opacity = "0";
              /* Reiniciar el contador */
              this.time = 10;
              /* Eliminar la ruta actual */
              socket.emit("deletepath", this.thisPath);
              /* Mostrar una alerta */
              swal({
                icon: "error",
                title: "¡Ruta caducada!",
                text: "Tu rival no volvió, no puedes seguir en partida",
                buttons: {
                  ok: {
                    text: "Aceptar",
                    className: "btn-small waves-effect waves-light"
                  }
                }
              }).then(res => {
                  swal.close();
                  document.body.style.height = "";
                  document.body.style.overflow = "";
                  window.location.href = '/home';
              });
              /* Redireccionar automáticamente luego de 5s */
              setTimeout(() => {
                swal.close();
                document.body.style.height = "";
                document.body.style.overflow = "";
                window.location.href = '/home';
              }, 5000);
            }
            /* Cuando el rival se vuelve a conectar */
            if (this.rivalState === 1) {
              clearInterval(interval);
              this.time = 10;
              document.body.style.height = "";
              document.body.style.overflow = "";
            }
          }, 1000);
        }, 500);
      }
    }
  },
  /* ----------------------- MÉTODOS DEL COMPONENTE ----------------------- */
  methods: {
    /* Saber si el jugador actual ganó */
    playerWinner(player) {
      // Combinaciones ganadoras
      const combs = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      // Contador
      let cont = 0;
      // Si se encontró alguna combinación
      let finded = false;
      // Combinación ganadora
      let winComb = null;
      for (let comb of combs) {
        for (let index of comb) {
          if (this.arrTriki[index] === player) cont++;
          if (cont === 3) {
            finded = true;
            break;
          }
        }
        cont = 0;
        winComb = comb;
        if (finded) break;
      }
      return {
        win: finded,
        comb: winComb
      };
    },
    /* Acciones a ejecutar cuando se da click en una casilla */
    getTarget(cell) {
      /* Índice que corresponde a la posición de la casilla a marcar */
      let index = this.getIndex(cell);
      /* Cuando la partida es activa y el turno corresponde al usuario */
      if (this.active && this.playerTurn === this.userData.nick) {
        /* Verificar que la casilla a marcar esté vacía */
        if (!cell.textContent.length) {
          /* Restaurar valores de respuesta */
          if (this.myResponse) this.myResponse = false;
          if (this.rivalResponse) this.rivalResponse = false;
          /* ---------- ACCIÓN DEL USUARIO EN TURNO ---------- */
          if (!this.auto) {
            this.turn++;
            /* Estilos a la casilla a marcar */
            let icon = (this.draw === 'X')
                    ?  `<i class="material-icons red-text">close</i>`
                    : `<i class="material-icons blue-text">panorama_fish_eye</i>`;
            cell.innerHTML = icon;
            cell.children[0].style.fontSize = '3rem';
            /* Rellener posición en el arreglo con el símbolo del usuario en turno */
            this.arrTriki[index] = this.draw;
            /* Verificar si ganó solo desde el turno 5 */
            if (this.turn >= 5) {
              let playerWinner = this.playerWinner(this.draw);
              /* Cuando el jugador actual gana */
              if (playerWinner.win) {
                if (localStorage.getItem("infoGame")) {
                  localStorage.removeItem("infoGame");
                }
                this.winner = true;
                this.active = false;
                this.comb = playerWinner.comb;
                swal({
                  icon: "success",
                  title: "¡Has ganado!",
                  text: `${this.rivalNick} no pudo contigo :)`,
                  buttons: {
                    no: {
                      text: "No jugar",
                      value: false,
                      className: "red"
                    },
                    ok: {
                      text: "Volver a jugar",
                      value: true,
                      className: "green"
                    }
                  },
                  closeOnClickOutside: false,
                  closeOnEsc: false
                }).then(action => {
                  /* Cuando se quiere volver a jugar */
                  if (action === true) {
                    /* Indicará que el usuario actual ya ha respondido */
                    this.myResponse = true;
                    /* Se elimina información de la partida anterior guardada localmente */
                    if (localStorage.getItem("infoGame")) {
                      localStorage.removeItem("infoGame");
                    }
                    /* Se le envía la respuesta al rival */
                    socket.emit("again", { res: true, nick: this.rivalNick });
                    /* Limpieza del tablero */
                    this.clear();
                    /* Alerta indicando la espera de la respuesta del rival, si no la ha hecho */
                    if (!this.active) {
                      swal({
                        icon: 'info',
                        text: "Esperando respuesta...",
                        buttons: false,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        timer: 10000
                      })
                      .then( res => {
                        if (!this.rivalResponse && this.rivalState !== 2 && this.myResponse) {
                          this.timeout = true;
                          socket.emit('deletepath', this.thisPath);
                          socket.emit('timeout', this.rivalNick);
                          swal({
                            icon: 'error',
                            title: '¡Tiempo de espera agotado!',
                            text: 'Tu rival no ha respondido, la partida actual ha finalizado.',
                            buttons:'Ok'
                          })
                          .then( res => window.location.href = '/home' );
                        }
                      });
                    }
                    /* Cuando no quiere volver a jugar */
                  } else if (action === false) {
                    /* Eliminación de la partida actual */
                    socket.emit("deletepath", this.thisPath);
                    /* Envío de respuesta al rival */
                    socket.emit("again", { res: false, nick: this.rivalNick });
                    /* Redirección a la página inicio */
                    setTimeout( () => window.location.href = '/home', 100);
                  }
                });
              }
            }
            /* Cuando se ha empatado */
            if (this.turn === 9 && !this.winner) {
              this.active = false;
              swal({
                icon: "info",
                title: "¡No hay ganador!",
                text: `Ha sido un empate`,
                buttons: {
                  no: {
                    text: "No jugar",
                    value: false,
                    className: "red"
                  },
                  ok: {
                    text: "Volver a jugar",
                    value: true,
                    className: "green"
                  }
                },
                closeOnClickOutside: false,
                closeOnEsc: false
              }).then(action => {
                /* Limpiar el tablero al dar click */
                if (action === true) {
                  this.myResponse = true;
                  if (localStorage.getItem("infoGame")) {
                    localStorage.removeItem("infoGame");
                  }
                  socket.emit("again", { res: true, nick: this.rivalNick });
                  this.clear();
                  if (!this.active) {
                    swal({
                      icon: "info",
                      text: "Esperando respuesta...",
                      buttons: false,
                      closeOnClickOutside: false,
                      closeOnEsc: false,
                      timer: 10000
                    })
                    .then( res => {
                      if (!this.rivalResponse && this.rivalState !== 2 && this.myResponse) {
                        this.timeout = true;
                        socket.emit('deletepath', this.thisPath);
                        socket.emit('timeout', this.rivalNick);
                        swal({
                          icon: 'error',
                          title: '¡Tiempo de espera agotado!',
                          text: 'Tu rival no ha respondido, la partida actual ha finalizado.',
                          buttons:'Ok',
                          closeOnClickOutside: false,
                          closeOnEsc: false
                        })
                        .then( res => window.location.href = '/home' );
                      }
                    });
                  }
                } else if (action === false) {
                  socket.emit("deletepath", this.thisPath);
                  socket.emit("again", { res: false, nick: this.rivalNick });
                  setTimeout( () => window.location.href = '/home', 100);
                }
              });
            }
            /* Emisión de evento para marcar casilla en el tablero del rival */
            socket.emit("nextturn", {
              // Nick usuario a próximo turno
              nick: this.rivalNick,
              // Símbolo que se dibujará en tablero del rival
              draw: this.draw,
              // Nick del usuario que emite el evento
              emited: this.userData.nick,
              // Posición del tablero donde se dibujará
              index: index
            });
            /* ---------- VERIFICACIONES ---------- */
            /* Cuando el usuario en turno no ha ganado  */
            if (!this.winner) {
              /* Si la partida aún está activa */
              if (this.active) {
                this.playerTurn = this.rivalNick;
              } else {
                /* Cuando ninguno de los dos ha ganado */
                this.playerTurn = this.p1;
              }
            } else {
              /* Cuando ganó, se le da el turno para iniciar */
              this.playerTurn = this.userData.nick;
            }
            /* ----- Backup de la partida ----- */
            /* Información de la partida al momento de la salida */
            localStorage.setItem( "infoGame", JSON.stringify({
                arrTriki: this.arrTriki,
                userLeft: this.userData.nick,
                next: this.playerTurn,
                turn: this.turn
              }) );
          } else {
            /* ----- ACCIÓN DEL RIVAL (EJECUCIÓN AUTOMÁTICA) ----- */
            this.turn++;
            /* Estilos de casilla a marcar */
            let icon = (this.rivalDraw.draw === 'X')
                    ?  `<i class="material-icons red-text">close</i>`
                    : `<i class="material-icons blue-text">panorama_fish_eye</i>`;
            cell.innerHTML = icon;
            cell.children[0].style.fontSize = '3rem';
            /* Rellenar posición en el arreglo con el símbolo del usuario en turno */
            this.arrTriki[index] = this.rivalDraw.draw;
            /* Verificar si ganó solo desde el turno 5 */
            if (this.turn >= 5) {
              let playerWinner = this.playerWinner(this.rivalDraw.draw);
              /* Cuando ganó el rival */
              if (playerWinner.win) {
                this.winner = true;
                this.active = false;
                this.comb = playerWinner.comb;
                if (localStorage.getItem("infoGame")) {
                  localStorage.removeItem("infoGame");
                }
                swal({
                  icon: "error",
                  title: "¡Has perdido!",
                  text: `${this.rivalNick} ha ganado :(`,
                  buttons: {
                    no: {
                      text: "No jugar",
                      value: false,
                      className: "red"
                    },
                    ok: {
                      text: "Volver a jugar",
                      value: true,
                      className: "green"
                    }
                  },
                  closeOnClickOutside: false,
                  closeOnEsc: false
                }).then(action => {
                  /* Limpiar el tablero al dar click */
                  if (action === true) {
                    this.myResponse = true;
                    if (localStorage.getItem("infoGame")) {
                      localStorage.removeItem("infoGame");
                    }
                    socket.emit("again", { res: true, nick: this.rivalNick });
                    this.clear();
                    if (!this.active) {
                      swal({
                        icon: "info",
                        text: "Esperando respuesta...",
                        buttons: false,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        timer: 10000
                      })
                      .then( res => {
                        if (!this.rivalResponse && this.rivalState !== 2 && this.myResponse) {
                          this.timeout = true;
                          socket.emit('deletepath', this.thisPath);
                          socket.emit('timeout', this.rivalNick);
                          swal({
                            icon: 'error',
                            title: '¡Tiempo de espera agotado!',
                            text: 'Tu rival no ha respondido, la partida actual ha finalizado.',
                            buttons:'Ok'
                          })
                          .then( res => window.location.href = '/home' );
                        }
                      });
                    }
                  } else if (action === false) {
                    socket.emit("deletepath", this.thisPath);
                    socket.emit("again", { res: false, nick: this.rivalNick });
                    setTimeout( () => window.location.href = '/home', 100);
                  }
                });
              }
            }
            /* Cuando se ha empatado */
            if (this.turn === 9 && !this.winner) {
              this.active = false;
              if (localStorage.getItem("infoGame")) {
                localStorage.removeItem("infoGame");
              }
              swal({
                icon: "info",
                title: "¡No hay ganador!",
                text: `Ha sido un empate`,
                buttons: {
                  no: {
                    text: "No jugar",
                    value: false,
                    className: "red"
                  },
                  ok: {
                    text: "Volver a jugar",
                    value: true,
                    className: "green"
                  }
                },
                closeOnClickOutside: false,
                closeOnEsc: false
              }).then(action => {
                /* Limpiar el tablero al dar click */
                if (action === true) {
                  this.myResponse = true;
                  if (localStorage.getItem("infoGame")) {
                    localStorage.removeItem("infoGame");
                  }
                  socket.emit("again", { res: true, nick: this.rivalNick });
                  this.clear();
                  if (!this.active) {
                    /* Alerta que desaparecerá a los 10s si el rival no responde */
                    swal({
                      icon: "info",
                      text: "Esperando respuesta...",
                      buttons: false,
                      closeOnClickOutside: false,
                      closeOnEsc: false,
                      timer: 10000
                    })
                    .then( res => {
                      /* Cuando el rival no ha respondido, pero el actual sí */
                      if (!this.rivalResponse && this.rivalState !== 2 && this.myResponse) {
                        this.timeout = true;
                        socket.emit('deletepath', this.thisPath);
                        socket.emit('timeout', this.rivalNick);
                        swal({
                          icon: 'error',
                          title: '¡Tiempo de espera agotado!',
                          text: 'Tu rival no ha respondido, la partida actual ha finalizado.',
                          buttons:'Ok'
                        })
                        .then( res => window.location.href = '/home' );
                      }
                    });
                  }
                } else if (action === false) {
                  socket.emit("deletepath", this.thisPath);
                  socket.emit("again", { res: false, nick: this.rivalNick });
                  setTimeout( () => window.location.href = '/home', 100);
                }
              });
            }
            /* ---------- VERIFICACIONES ---------- */
            /* Cuando el rival no ha ganado */
            if (!this.winner) {
              /* Estando la partida activa */
              if (this.active) {
                this.playerTurn = this.userData.nick;
                this.auto = false;
              } else {
                /* Partida inactiva y ninguno de los dos ganó */
                this.playerTurn = this.p1;
              }
            } else {
              /* Cuando gana se le da el turno */
              this.playerTurn = this.rivalNick;
            }
            /* ----- Backup de la partida ----- */
            /* Información de la partida al momento de la salida */
            localStorage.setItem( "infoGame", JSON.stringify({
                arrTriki: this.arrTriki,
                userLeft: this.userData.nick,
                next: this.playerTurn,
                turn: this.turn
              }) );
          }
        }
      }
    },
    /* Resetear valores */
    clear() {
      this.turn = 0;
      this.winner = false;
      this.comb = [];
      this.auto = false;
      this.arrTriki.fill("-");
      for (let cell in this.cells) {
        if (cell < 9) {
          this.cells[cell].innerHTML = "";
          this.cells[cell].style.cursor = "default";
        }
      }
    },
    /* Obtener la posición de la casilla donde se da click */
    getIndex(td) {
      let index = null;
      for (let cell in this.cells) {
        if (this.cells[cell] === td) {
          index = cell;
          break;
        }
      }
      return index;
    },
    /* Mensaje de confirmación al intentar abandonar una partida */
    closeSession() {
      swal({
        title: '¡Abandonar partida!',
        icon: 'warning',
        text: '¿Estás seguro de abandonar la partida?',
        dangerMode: true,
        buttons: {
          no: {
            text: 'No',
            value: false,
            className: 'green'
          },
          si: {
            text: 'Sí',
            value: true,
            className: 'red'
          }
        },
        closeOnClickOutside: false,
        closeOnEsc: false
      })
      .then( action => {
        if (action === true) {
          socket.emit('forceleft', this.thisPath);
          setTimeout( () => window.location.href = '/home', 100);
        }
      });
    },
    /* Cerrado total de sesión */
    closeTotalSession(e) {
      e.preventDefault();
      M.Sidenav.getInstance(document.querySelector('#menu-side')).close();

      localStorage.removeItem('token');
      this.$router.push({name: 'login', params: {
          redirected: true
      }});
      socket.emit('forceleft', this.thisPath);
    }
  },
  filters: {
    upperCase(value) {
      return (value) ? value.toUpperCase() : '';
    }
  },
  /* ------------------------- COMPONENTES ------------------------------ */
  components: {
    /* Barra lateral y superior */
    Sidenav,
    /* Spinner de carga */
    Spinner,
    Chat,
    /* Tablero de juego */
    tableTriki: {
      template: `
                <div class="div-table">
                    <div class="div-tr" v-for="tr in 3">
                        <div class="div-td" v-for="td in 3" @click="getAction($event)">
                        </div>
                    </div>
                </div>
            `,
      methods: {
        /* Enviar el elemento al padre donde se da click */
        getAction(e) {
          this.$emit("getaction", e.target);
        }
      }
    }
  },
  /* -------------------- PROPIEDADES DEL COMPONENTE -------------------- */
  props: {
    /* Jugador local (retador) */
    p1: {
      type: String,
      default: "Player1",
      required: true
    },
    /* Jugador visitante (retado) */
    p2: {
      type: String,
      default: "Player2",
      required: true
    }
  }
};
</script>