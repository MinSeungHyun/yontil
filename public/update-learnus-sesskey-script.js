var sesskey = localStorage.getItem('sesskey')

if (window.M?.cfg?.sesskey && sesskey) {
  window.M.cfg.sesskey = sesskey
}
