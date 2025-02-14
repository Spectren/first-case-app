import React from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import styles from "assets/jss/material-kit-react/components/offerActions.js";
import Button from "../CustomButtons/Button";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import Badge from "../Badge/Badge";

const dashboardRoutes = [];
const useStyles = makeStyles(styles);


export default function OfferActions(props) {
    const classes = useStyles();
    const {product} = props;

    return (
        <div className={classNames(classes.main)}>
            <Typography variant="subtitle1" color="textPrimary" component="p">
                Сделаю за: <br/>
                <span style={{fontWeight: "bold", color: "#000", textAlign: "center"}}>
                    {product.price ? product.price : "Не указано"}
                </span>
            </Typography>
            <Typography variant="subtitle1" color="textPrimary" component="p">
                Срок исполнения: <br/> <span
                style={{fontWeight: "bold", color: "#000", textAlign: "center"}}>
                {product.deadline ? new Date(product.deadline).toDateString() : "Не указано"}
            </span>
            </Typography>

            <Button color="success" className={classNames(classes.btn)}>Откликнуться</Button>
            <Button color="danger" className={classNames(classes.btn)}>Отклонить</Button>
        </div>
    );
}

