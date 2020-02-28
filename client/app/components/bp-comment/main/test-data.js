getCommentsAPI(key) {
  // return this._http.get(`${this.bpSettingsService.serverApiUrl}/api/comments/${key}`);
  return this.$q((resolve, reject) => {
    resolve({
              data: [
                {
                  id: '1',
                  text: 'Mhm wondering if this comment will hit the generator as well..',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '5',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/women/63.jpg'
                }
                },
                {
                  id: '2',
                  text: 'Test comment',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '5',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/women/44.jpg'
                }
                },
                {
                  id: '3',
                  text: 'Another test comment',
                  dtCreated: new Date(),
                dtUpdated: new Date(),
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/women/68.jpg'
                }
                },
                {
                  id: '4',
                  text: 'What a beautiful day!',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/men/46.jpg'
                }
                },
                {
                  id: '5',
                  text: 'Please lets get back to topic',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/men/1.jpg'
                }
                },
                {
                  id: '6',
                  text: 'Mhm wondering if this comment will hit the generator as well..',
                  isReply: false,
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/men/62.jpg'
                }
                },
                {
                  id: '7',
                  text: 'Mhm wondering if this comment will hit the generator as well..',
                  isReply: false,
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/men/29.jpg'
                }
                },
                {
                  id: '8',
                  text: 'Mhm wondering if this comment will hit the generator as well..',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/lego/3.jpg'
                }
                },
                {
                  id: '9',
                  text: 'Mhm wondering if this comment will hit the generator as well..',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/lego/6.jpg'
                }
                },
                {
                  id: '10',
                  text: 'Mhm wondering if this comment will hit the generator as well..',
                  dtCreated: new Date(),
                dtUpdated: null,
                createdBy: {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  position: 'Product Manager',
                  picture: 'https://randomuser.me/api/portraits/women/22.jpg'
                }
                }
              ]
            });
});
}