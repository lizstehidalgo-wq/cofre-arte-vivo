// =========================================================================
// ASISTENTE DE CUMPLEAÑOS - COFRE ARTE VIVO
// =========================================================================
// Este script revisa todos los días si algún cliente cumple años hoy.
// Si alguien cumple años, te envía un email con un enlace mágico para 
// felicitarlo por WhatsApp con un solo clic.
// =========================================================================

function revisarCumpleanos() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Obtenemos todos los datos (ignorando la primera fila de títulos)
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Quita la fila 1

    // Obtener la fecha de hoy 
    const hoy = new Date();
    const mesHoy = hoy.getMonth() + 1; // getMonth() devuelve 0-11
    const diaHoy = hoy.getDate();

    let cumpleaneros = [];

    // Revisamos cada cliente (asumiendo: A=Nombre, B=Email, C=Teléfono, D=Cumpleaños)
    for (let i = 0; i < data.length; i++) {
        const fila = data[i];
        const nombre = fila[0];
        const telefono = fila[2];
        const fechaCumple = fila[3]; // Formato esperado: YYYY-MM-DD

        if (fechaCumple) {
            // Parsear la fecha del cliente
            const fechaObj = new Date(fechaCumple);
            // Validar que la fecha sea válida
            if (!isNaN(fechaObj.getTime())) {
                const mesCumple = fechaObj.getUTCMonth() + 1;
                const diaCumple = fechaObj.getUTCDate();

                // ¿Coinciden el día y el mes?
                if (mesCumple === mesHoy && diaCumple === diaHoy) {
                    cumpleaneros.push({
                        nombre: nombre,
                        telefono: telefono
                    });
                }
            }
        }
    }

    // Si encontramos cumpleañeros hoy, ¡te enviamos el email!
    if (cumpleaneros.length > 0) {
        enviarCorreoAlerta(cumpleaneros);
    }
}

function enviarCorreoAlerta(lista) {
    // ⚠️ PON TU CORREO AQUÍ (Donde quieres recibir los avisos)
    const tuCorreo = Session.getActiveUser().getEmail();

    let asunto = `🎂 ¡Alerta de Cumpleaños! (${lista.length} clientes hoy)`;
    let mensajeHTML = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">`;
    mensajeHTML += `<h2 style="color: #cc0000;">🌿 Cofre Arte Vivo - Asistente de Cumpleaños</h2>`;
    mensajeHTML += `<p>¡Hola! Tienes clientes celebrando su cumpleaños hoy. Haz clic en el botón verde para enviarles su recuadro de felicitación en WhatsApp:</p>`;

    // Construir la lista de clientes
    mensajeHTML += `<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">`;

    for (let i = 0; i < lista.length; i++) {
        const c = lista[i];

        // Limpiar el teléfono (quitar espacios, guiones, y asegurarse de que empiece con código de país si es necesario)
        let cel = c.telefono.toString().replace(/\D/g, '');
        // Si el número es de Ecuador y empieza con 09..., le ponemos 593
        if (cel.startsWith('09') && cel.length === 10) {
            cel = '593' + cel.substring(1);
        }

        // El texto que le enviaremos al cliente:
        const textoFelicidad = `¡Hola ${c.nombre}! 🎉 Todo el equipo de Cofre Arte Vivo te desea un muy feliz cumpleaños. 🌿%0A%0AQueremos celebrarlo contigo regalándote un descuento especial del 30% en tu próxima plantita. ¡Que disfrutes tu día! 🎂`;

        // Enlace mágico de WhatsApp
        const linkWa = `https://wa.me/${cel}?text=${textoFelicidad}`;

        mensajeHTML += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px 5px;">
          <strong>👤 ${c.nombre}</strong><br>
          📱 ${c.telefono}
        </td>
        <td style="text-align: right;">
          <a href="${linkWa}" target="_blank" style="background-color: #25D366; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Felicitar por WhatsApp 💬
          </a>
        </td>
      </tr>
    `;
    }

    mensajeHTML += `</table>`;
    mensajeHTML += `<p style="margin-top: 30px; font-size: 12px; color: #999;">Generado automáticamente por tu página web.</p>`;
    mensajeHTML += `</div>`;

    // Enviar el correo
    MailApp.sendEmail({
        to: tuCorreo,
        subject: asunto,
        htmlBody: mensajeHTML
    });
}
