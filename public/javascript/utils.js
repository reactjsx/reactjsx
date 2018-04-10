var exports = module.exports = {};

exports.formatDate = (timestamp) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date(timestamp);
    const day = d.getDate();
    let thOrder = '';
    if (day % 10 === 1) {
        thOrder = 'st';
    }
    else if (day % 10 === 2) {
        thOrder = 'nd';
    }
    else if (day % 10 === 3) {
        thOrder = 'rd';
    }
    else {
        thOrder = 'th';
    }
    return months[d.getMonth()] + ' ' + day + thOrder + ', ' + d.getFullYear();
};