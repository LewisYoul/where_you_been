const Mapbox = Vue.component('Mapbox', {
  template: `
  <div style='width: 100%; height: 100%; display: flex;'>
    <div v-if="activities.length > 0" class="activities">
      <div v-for="activity in activities" @mouseover="mouseover(activity)" @mouseleave="mouseleave" @click="flyTo(activity)" class="activity">
        <div style="margin-right: 10px;">
          <div style="">
            <span class="block" style="font-size: 18px;">{{ activity.name() }}</span>
          </div>
          <span class="block" style="font-size: 12px; margin-top: 4px; color: grey;">{{ activity.startDate() }}</span>
        </div>
        <div>
          <img width="25" height="25" :src="'assets/images/' + activity.icon()"></img>
        </div>
      </div>
    </div>
    <div id='map' style='width: 100%; height: 100%; flex: 4;'>
      <Modal v-if="showModal" @close="obtainStravaAuth"></Modal>
    </div>
  </div>
  `,

  data() {
    return {
      showModal: false,
      map: null,
      activities: []
    }
  },

  mounted() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGV3aXN5b3VsIiwiYSI6ImNqYzM3a3lndjBhOXQyd24zZnVleGh3c2kifQ.qVH2-BA02t3p62tG72-DZA';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11'
    });
  },

  created() {
    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.has('code')) {
      this.obtainBearerToken(searchParams.get('code'))
    } else {
      this.showModal = true
    }
  },

  methods: {
    mouseover(activity) {
      this.activities.forEach(activity => activity.hide())
      activity.mouseover()
    },

    mouseleave() {
      this.activities.forEach(activity => activity.mouseleave())
    },

    flyTo(activity) {
      activity.flyTo()
    },

    obtainStravaAuth() {
      // Really all of these requests should be made server side to prevent secrets from being visible
      const clientId = 57045;
      const redirectUri = 'https://lewisyoul.github.io/where_you_been';
      const authUri = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=activity:read`

      window.location = authUri
    },

    obtainBearerToken(code) {
      const params = {
        client_id: "57045",
        client_secret: "05a3f29d756923b9bec7648f41f5e3ff997ed60c",
        code: code,
        grant_type: "authorization_code"
      }
  
      axios.post('https://www.strava.com/oauth/token', null, { params })
        .then(res => {
          this.plotActivities(res.data.access_token)
        })
        .catch(err => {
          this.showModal = true
        })
    },
  
    plotActivities(bearerToken) {
      const activitiesUrl = "https://www.strava.com/api/v3/athlete/activities";
    
      axios.get(activitiesUrl, { headers: { 'Authorization': `Bearer ${bearerToken}` } })
        .then(res => {
          const activities = res.data
    
          activities.forEach(activityObj => {
            let activity = new Activity(activityObj, this.map)

            activity.addToMap()
            this.activities.push(activity)
          })

          setTimeout(() => {
            this.map.resize();
            if (this.activities.length > 0) { this.activities[0].flyTo(); };
          }, 50)
        })
        .catch(err => {
          this.showModal = true
        })
    },
  }
})
