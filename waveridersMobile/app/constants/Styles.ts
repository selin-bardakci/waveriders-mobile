import { StyleSheet } from "react-native";
import Colors from "./Colors";

export const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFFFF'
    },

    inputField: {
        height: 44,
        borderWidth: 1,
        borderColor: '#ABABAB',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#FFF'
    },
    btn: {
        backgroundColor: '#3333FF',
        height: 50,
        width: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'mon-b',
    },
    btnIcon: {
        position: 'absolute',
        left: 16,
    },
    footer: {
        position: 'absolute',
        height:100,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopColor: Colors.gray,
        borderTopWidth: StyleSheet.hairlineWidth,
    }
})
