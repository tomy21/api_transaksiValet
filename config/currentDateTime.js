// Function to get the current date and time in the timezone specified
function getCurrentDateTime(timeZone) {
  let nz_date_string = new Date().toLocaleString("en-US", {
    timeZone: timeZone,
  });
  let date_nz = new Date(nz_date_string);

  let year = date_nz.getFullYear();
  let month = ("0" + (date_nz.getMonth() + 1)).slice(-2);
  let date = ("0" + date_nz.getDate()).slice(-2);
  let hours = ("0" + date_nz.getHours()).slice(-2);
  let minutes = ("0" + date_nz.getMinutes()).slice(-2);
  let seconds = ("0" + date_nz.getSeconds()).slice(-2);

  let date_yyyy_mm_dd = year + "-" + month + "-" + date;
  let time_hh_mm_ss = hours + ":" + minutes + ":" + seconds;
  let date_time =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  return {
    date_yyyy_mm_dd,
    time_hh_mm_ss,
    date_time,
  };
}

// Export the function to make it available in other modules
module.exports = getCurrentDateTime;
