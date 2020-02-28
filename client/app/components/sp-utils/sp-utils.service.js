'use strict';

function spUtils() {

    let iconColor = ['#9575CD', '#90a4ae', '#42a5f5', '#5c6bc0', '#81c784', '#64b5f6'];// there are bg colors of icons

    function encodeOptimizedSVGDataUri(svgString) {
        let uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
            .replace(/%0A/g, '') // remove newlines
            .replace(/%20/g, ' ') // put spaces back in
            .replace(/%3D/g, '=') // ditto equals signs
            .replace(/%3A/g, ':') // ditto colons
            .replace(/%2F/g, '/') // ditto slashes
            .replace(/%22/g, "'"); // replace quotes with apostrophes (may break certain SVGs)

        return 'data:image/svg+xml,' + uriPayload;
    }
    return {
        validateEmail: function (email) {
            const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i;
            return re.test(email);
        },
        setAvatar (user) {
            let email = user.email.toLowerCase();//icons for demo
            if (email.indexOf('rohorodnyk') === 0) user.avatarFileId = '/assets/avatars/rohorodnyk.jpg';
            else user.avatarFileId = '/assets/avatars/rohorodnyk.jpg';


            if (!user.avatarFileId){
                let key = user.userId;
                if (!key || !user.firstName || !user.lastName) return null;
                let numberForName = 0;
                for (let i = 0; i < key.length; i++) {
                    numberForName += key.charCodeAt(i);
                }
                let firstSymbols = '';
                //make random symbols
                let words        = 'QWERTYUIOPASDFGHJKLZXCVBNM';
                let max_position = words.length - 1;
                for(let i = 0; i < 2; ++i ) {
                    let position = Math.floor ( Math.random() * max_position );
                    firstSymbols = firstSymbols + words.substring(position, position + 1);
                }

                let bgColor = '';
                if(user.firstName || user.email) {
                    if(!user.firstName.trim()){
                        firstSymbols = user.email[0].toUpperCase() + user.email[1].toUpperCase();
                    }
                    else {
                        firstSymbols = user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase();
                    }
                }
                // bgColor = iconColor[0];
                // let tmp = iconColor.shift(); // ruslan color style
                // iconColor.push(tmp);
                bgColor = iconColor[numberForName % 6];
                let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
                                '<circle cx="16" cy="16" r="16" fill="' + bgColor + '" />' +
                                '<text text-anchor="middle" x="16" y="21" font-weight="500"  font-family="sans-serif" font-size="14px" fill="white">' + firstSymbols + '</text>' +
                            '</svg>';
                user.avatarFileId = encodeOptimizedSVGDataUri(svg);
            }
        }
    }
}

export default spUtils;
