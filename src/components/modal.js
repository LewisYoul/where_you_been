const Modal = Vue.component('Modal', {
  template: `
  <div id="modal" data-controller="modal" data-target="modal.modal" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
  
        <h2>Welcome to All My Routes</h2>
        <p>Please authorize Strava to continue.</p>
        <div class="button-wrapper">
          <button id="authorize" @click="closeModal">AUTHORIZE</button>
        </div>

      </div>
    </div>
  </div>`,

  created() {
    console.log('modal')
  },

  methods: {
    closeModal() {
      this.$emit('close')
      console.log('fd')
    }
  }
})
