// authorize.test.js
import authorize from '../../src/middleware/authorize';

describe('authorize', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { role: 'admin' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next if user is authorized', () => {
        authorize(['admin'])(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not authorized', () => {
        req.user.role = 'user';
        authorize(['admin'])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });
});