import React, { useReducer, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import Checkbox from '@material-ui/core/Checkbox'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Badge from '@material-ui/core/Badge'
import Spinner from './Spinner'

const styles = theme => ({
  listCheckboxRoot: {
    minWidth: 36
  },
  badge: {
    flex: '1 1 auto'
  },
  listItemText: {
    marginLeft: 12
  }
})

export const EscoOccupationList = (props) => {
  const initialState = {
    openOccupations: [], // Array of uris,
    selectedOccupations: [], // Array of occupations
    children: {} // ParentCode: parent occupation code, value: it's children
  }
  const reducer = (state, newState) => ({ ...state, ...newState })
  const [state, setState] = useReducer(reducer, initialState)

  const { classes, occupations, topLevel, fetchOccupationChildren, selectable, onOccupationCheck, level } = props
  const isOccupationOpen = (uri) => {
    if (state.openOccupations.length > 0) {
      return state.openOccupations.find(occu => occu === uri) != null
    } else return false
  }

  const isWithinMaxParentLevel = (occu) => occu.code.length <= topLevel

  const isOccupationChecked = (occupation) => props.selectedOccupations.find(selected => selected.code === occupation.code) != null

  const countSelectedChildren = (occupation) => {
    const codeLength = occupation.code.length
    const children = props.selectedOccupations.filter(selectedOccupation => {
      return selectedOccupation.code.substring(0, codeLength) === occupation.code && selectedOccupation.code.length > codeLength
    })
    return children.length
  }

  const handleOccupationOpen = (clickedOccupation) => {
    if (isOccupationOpen(clickedOccupation.uri)) {
      // Close
      const newOpenOccupations = state.openOccupations.filter(occu => {
        if (occu !== clickedOccupation.uri) return clickedOccupation.uri
      })
      setState({ openOccupations: newOpenOccupations })
    } else if (isWithinMaxParentLevel(clickedOccupation)) {
      // Open
      const newOpenOccupations = [...state.openOccupations, clickedOccupation.uri]
      setState({ openOccupations: newOpenOccupations })
      handleChildrenOccupations(clickedOccupation)
    }
  }

  const handleOccupationCheck = (checkedOccupation) => {
    onOccupationCheck(checkedOccupation)
  }

  const handleChildrenOccupations = (openedOccupation) => {
    // Only need to fetch children, if they are not already fetched
    if (!state.children[openedOccupation.code]) {
      fetchOccupationChildren(openedOccupation.uri).then(fetchedChildren => {
        const newChildren = { ...state.children }
        newChildren[openedOccupation.code] = fetchedChildren
        setState({ children: newChildren })
      })
    }
  }

  const renderSelect = (selectableOccupation) => {
    if (selectable) {
      return (
        <ListItemIcon classes={{ root: classes.listCheckboxRoot }}>
          <Checkbox
            color='primary'
            edge='start'
            onChange={e => handleOccupationCheck(selectableOccupation)}
            checked={isOccupationChecked(selectableOccupation)}
          />
        </ListItemIcon>
      )
    } else return null
  }

  const renderText = (occupation) => {
    if (props.badges != null) {
      return (
        <Badge
          color='primary'
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          badgeContent={countSelectedChildren(occupation)}
          classes={{ root: classes.badge }}
        >
          <ListItemText primary={occupation.title} onClick={e => handleOccupationOpen(occupation)} classes={{ root: classes.listItemText }} />
        </Badge>
      )
    } else {
      return (
        <ListItemText primary={occupation.title} onClick={e => handleOccupationOpen(occupation)} />
      )
    }
  }

  const renderExpandIcon = (occupation) => {
    if (isWithinMaxParentLevel(occupation)) {
      return (
        <div>
          {isOccupationOpen(occupation.uri) ? <ExpandLess onClick={e => handleOccupationOpen(occupation)} /> : <ExpandMore onClick={e => handleOccupationOpen(occupation)} />}
        </div>
      )
    } else return null
  }

  const nestedLevel = level || 1
  const nestedPadding = nestedLevel * 16
  const possibleNestedStyles = { paddingLeft: nestedPadding }
  return (
    <List>
      {occupations &&
        occupations.map((occupation, index) => {
          return (
            <Fragment key={`${occupation.uri}-${nestedLevel}`}>
              <ListItem button style={possibleNestedStyles}>
                {renderSelect(occupation)}
                {renderText(occupation)}
                {renderExpandIcon(occupation)}
              </ListItem>
              <Collapse in={isOccupationOpen(occupation.uri)} timeout='auto' unmountOnExit>
                <EscoOccupationList
                  occupations={state.children[occupation.code]}
                  selectedOccupations={props.selectedOccupations}
                  topLevel={2}
                  level={nestedLevel + 1}
                  selectable={selectable}
                  badges={props.badges}
                  fetchOccupationChildren={fetchOccupationChildren}
                  onOccupationCheck={onOccupationCheck}
                  classes={classes}
                />
              </Collapse>
            </Fragment>
          )
        })}
      {occupations == null &&
        <Spinner centered />}
    </List>
  )
}

export default withStyles(styles)(EscoOccupationList)
