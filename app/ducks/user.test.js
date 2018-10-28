import userReducer from './user';
import * as user from './user';

test('Updates state upon user log in.', () => {
	expect(userReducer({ loggedIn: false }, { type: user.LOGIN_SUCCEEDED }))
	.toBe({ loggedIn: true });
});
