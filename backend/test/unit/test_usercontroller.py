import pytest
import unittest.mock as mock

from src.controllers.usercontroller import UserController

@pytest.fixture
def sut(daoList):
        mockedDAO = mock.MagicMock()

        mockedDAO.find.return_value = daoList

        mockedReturnValue = UserController(dao=mockedDAO)
        return mockedReturnValue

"""test if first object is returned if email is valid and that None is return if email is valid but not in Database"""
@pytest.mark.unit
@pytest.mark.parametrize('daoList, expected',
    [  
        ([{"email": 'gloria@gmail.se'}], {"email": 'gloria@gmail.se'}),
        ([{"email": 'gloria@gmail.se'}, {"email": 'gloria@gmail.se'}, {"email": 'gloria@gmail.se'}], {"email": 'gloria@gmail.se'}),
        ([], None)
    ]
)
def test_valid_email(sut, expected):
    ValidEmailResult = sut.get_user_by_email(email="gloria@gmail.se")

    assert ValidEmailResult == expected

"""test if Value Error is thrown if email is not valid"""
@pytest.mark.unit
@pytest.mark.parametrize('daoList, expected',
    [ 
        ([{"email": 'gloria@gmail.se'}], {"email": 'gloria@gmail.se'}),
    ]
)
def test_invalid_email(sut, expected):
    with pytest.raises(ValueError):
        inValidEmailResult = sut.get_user_by_email(email="ijjgfddfhhj")

        assert inValidEmailResult == expected

"""test if Exception is thrown if database error"""
@pytest.mark.unit
def test_database_error():
    mockedDAO = mock.MagicMock()

    mockedDAO.find.return_value = Exception

    mockedReturnValue = UserController(dao=mockedDAO)

    with pytest.raises(Exception):
        expected = {"email": 'gloria@gloria.se'}
        databaseErrorResult = mockedReturnValue.get_user_by_email(email="gloria@gloria.se")

        assert databaseErrorResult == expected


"""Extra test for checking the print statement when in side the else statement (a whitebox test) """
@pytest.mark.unit
def test_UserController_multipleUsers(capsys):
    mockedDAO = mock.MagicMock()

    mockedDAO.find.return_value = [{"email": 'gloria@gmail.se'}, {"email": 'gloria@gmail.se'}, {"email": 'gloria@gmail.se'}]

    mockedUser = UserController(dao=mockedDAO)

    mockedUser.get_user_by_email(email='gloria@gmail.se')
    captured_print = capsys.readouterr()
    assert captured_print.out == 'Error: more than one user found with mail gloria@gmail.se\n'
