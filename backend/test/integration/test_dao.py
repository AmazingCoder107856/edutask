import pytest
import unittest.mock as mock
from pymongo.errors import WriteError
from unittest.mock import patch
import json 

from src.util.dao import DAO
import json

testValidator =     {
"$jsonSchema": {
        "bsonType": "object",
        "required": ["title", "description", "bool_value"],
        "properties": {
            "title": {
                "bsonType": "string",
                "description": "the title of a task must be determined",
                "uniqueItems": True
            }, 
            "description": {
                "bsonType": "string",
                "description": "the description of a task must be determined"
            },
                "bool_value": {
                "bsonType": "bool",
                "description": "the description of a task must true or false"
            }, 
        }
    }
}

@pytest.fixture
def sut():
    with patch("src.util.dao.getValidator", autospec=True) as mockGetValidators:
        mockGetValidators.return_value = testValidator
        task = DAO(collection_name="testTask")

        yield task
        task.collection.drop()


'''1 . Test to see if object is returned if all required properties is present, valid bson data, unique items (only 1 item with same name in document)'''
@pytest.mark.integration
@pytest.mark.parametrize('inputData, expected',
    [
        ({"title": "test if title is string", "description": "test if description is string not need to be unique", "bool_value": True}, dict),
    ]
)
def test_create(sut, inputData,  expected):
    valid_res = sut.create(inputData)
    assert type(valid_res) == expected

"""
Test to see if exception is raised if: 
[0] all required properties is present, INVALID BSON, unique items
[1] all required properties is NOT PRESENT, valid bson data, unique items
[2] all required properties is NOT PRESENT, invalid bson data, unique items
"""
@pytest.mark.parametrize('inputData, expected',
    [
        ({"title": "title", "description": 1, "bool_value": True}, "WriteError"),
        ({"title": "title", "bool_value": True}, "WriteError"),
        ({"title": "title", "bool_value": "hej"}, "WriteError"),           
    ]
)
@pytest.mark.integration
def test_invalid_writeerror(sut, inputData, expected):
    with pytest.raises(WriteError):
        sut.create(inputData)
    assert expected in str(WriteError)

"""
Test to see if all properties is present, valid bson and not unique item.
dao.js need correction before all test scenarios can be implemented.
"""
@pytest.mark.parametrize('inputData, expected',
    [
        ([{"title": "title", "description": "right", "bool_value": True}, {"title": "title", "description": "right", "bool_value": True}], "WriteError"), 
    ]
)
@pytest.mark.integration
def test_invalid_uniqueItems(sut, inputData, expected):
    with pytest.raises(WriteError):
        for item in inputData:
            sut.create(item)
    assert expected in str(WriteError)
