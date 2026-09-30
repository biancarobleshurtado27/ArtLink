import axios from 'axios'

const articClient = axios.create({ baseURL: 'https://api.artic.edu/api/v1' })

async function run() {
    try {
        const { data: artistData } = await articClient.get(`/artworks/search?q=35061&limit=1&fields=artist_title`)
        // wait, earlier q=35061 returned 0 length!
        // so we can't even get the artist title from idPart.
        // Wait! How does getRealArtistProfile work?
    } catch(e) {
        console.error(e)
    }
}
run();
