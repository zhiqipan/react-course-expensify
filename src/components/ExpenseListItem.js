import React from 'react';
import {Link} from 'react-router-dom';

export const ExpenseListItem = (props) => {
    const {id, amount, description, note, createdAt} = props;
    return (
        <div>
            <Link to={`/edit/${id}`}>
                <h3>{description}</h3>
            </Link>
            <p>{amount} - {createdAt}</p>
        </div>
    );
};

export default ExpenseListItem;