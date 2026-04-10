# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "gsap", to: "https://ga.jspm.io/npm:gsap@3.14.2/index.js"
pin "three", to: "https://ga.jspm.io/npm:three@0.183.2/build/three.module.js"
