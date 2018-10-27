/**
 * @param {Number} status Número del estado
 * @param {Boolean} created Saber si se insertó algún dato
 * @param {Boolean} updated Saber si se actualizó algún dato
 * @param {Object} data Valores devueltos
 */
function apiResponse(status, created, updated, data = null) {
    return {
        status,
        created,
        updated,
        data
    }
}

module.exports = {
    apiResponse
}