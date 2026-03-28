import { all, fork } from 'redux-saga/effects';
import { metricsSaga } from './metrics/metricsSaga';
import { roleSaga } from './auth/roleSaga';
import { availabilitySaga } from './availability/availabilitySaga';
import { inventorySaga } from './inventory/inventorySaga';
import { guestsSaga } from './guests/guestsSaga';
import { promoCodesSaga } from './promoCodes/promoCodesSaga';
import { pricingRulesSaga } from './pricingRules/pricingRulesSaga';
import { physicalRoomsSaga } from './physicalRooms/physicalRoomsSaga';
import { reservationsSaga } from './reservations/reservationsSaga';
import { hotelsSaga } from './hotels/hotelsSaga';
import { membersSaga } from './members/membersSaga';
import { invitationsSaga } from './invitations/invitationsSaga';
import { adminSaga } from './admin/adminSaga';

export default function* rootSaga() {
    yield all([
        fork(metricsSaga),
        fork(roleSaga),
        fork(availabilitySaga),
        fork(inventorySaga),
        fork(guestsSaga),
        fork(promoCodesSaga),
        fork(pricingRulesSaga),
        fork(physicalRoomsSaga),
        fork(reservationsSaga),
        fork(hotelsSaga),
        fork(membersSaga),
        fork(invitationsSaga),
        fork(adminSaga),
    ]);
}
