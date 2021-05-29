import _ from 'lodash';
import BooleanExpression from './BooleanExpression';
import prettytemNames from '../data/prettyItemNames.json';

class LogicHelper {
    static logic;

    static bindLogic(logic) {
        this.logic = logic;
    }

    static parseRequirement(requirement, visitedMacros) {
        const macroValue = this.logic.macros.getMacro(requirement);
        if (macroValue) {
            if (visitedMacros.has(requirement)) {
                return "Impossible"
            }
            return this.booleanExpressionForRequirements(macroValue, visitedMacros.add(requirement));
        }

        const trickMatch = requirement.match(/^([\w\s]+) Trick$/);
        let expanded_requirement;

        if (trickMatch) {
            const trickName = trickMatch[1];
            expanded_requirement = `Option "enabled-tricks" Contains "${trickName}"`;
        } else {
            expanded_requirement = requirement
        }

        const optionEnabledRequirementValue = this.checkOptionEnabledRequirement(expanded_requirement);
        if (!_.isNil(optionEnabledRequirementValue)) {
            return optionEnabledRequirementValue ? 'Nothing' : 'Impossible';
        }
        return requirement;
    }

    static booleanExpressionForTokens(expressionTokens, visitedMacros) {
        const itemsForExpression = [];
        let expressionTypeToken;
        while (!_.isEmpty(expressionTokens)) {
            const currentToken = expressionTokens.shift();
            if (currentToken === '&' || currentToken === '|') {
                expressionTypeToken = currentToken;
            } else if (currentToken === '(') {
                const childExpression = this.booleanExpressionForTokens(expressionTokens, visitedMacros);
                itemsForExpression.push(childExpression);
            } else if (currentToken === ')') {
                break;
            } else {
                itemsForExpression.push(this.parseRequirement(currentToken, visitedMacros));
            }
        }
        if (expressionTypeToken === '|') {
            return BooleanExpression.or(...itemsForExpression);
        }
        return BooleanExpression.and(...itemsForExpression);
    }

    static requirementImplies(firstRequirement, secondRequirement) {
        if (firstRequirement === secondRequirement) {
            return true;
        }
        if (firstRequirement === 'Impossible') {
            return true;
        }

        if (secondRequirement === 'Nothing') {
            return true;
        }
        const firstItemCountRequirement = LogicHelper.parseItemCountRequirement(firstRequirement);
        const secondItemCountRequirement = LogicHelper.parseItemCountRequirement(secondRequirement);

        if (!_.isNil(firstItemCountRequirement) && !_.isNil(secondItemCountRequirement)) {
            if (firstItemCountRequirement.itemName === secondItemCountRequirement.itemName) {
                return firstItemCountRequirement.countRequired > secondItemCountRequirement.countRequired;
            }
        }
        return false;
    }

    static splitExpression(expression) {
        // console.log(expression)
        return _.compact(
            _.map(expression.split(/\s*([(&|)])\s*/g), _.trim),
        );
    }

    static booleanExpressionForRequirements(requirements) {
        const expressionTokens = this.splitExpression(requirements);
        const expression = this.booleanExpressionForTokens(expressionTokens, new Set());
        return expression;
    }

    static createReadableRequirements(requirements) {
        if (requirements.type === 'and') {
            return _.map(requirements.items, (item) => _.flattenDeep(this.createReadableRequirementsHelper(item)));
        }
        if (requirements.type === 'or') {
            return [_.flattenDeep(this.createReadableRequirementsHelper(requirements))];
        }
        throw Error(`Cannot create requirements for invalid type ${requirements.type}`);
    }

    static createReadableRequirementsHelper(requirements) {
        if (requirements.item) {
            const prettyItemName = LogicHelper.prettyNameForItemRequirement(requirements.item);
            return [{
                item: requirements.item,
                name: prettyItemName,
            }];
        }
        return _.map(requirements.items, (item, index) => {
            const currentResult = [];
            if (item.items) { // expression
                currentResult.push([
                    {
                        item: '(',
                        name: '(',
                    },
                    this.createReadableRequirementsHelper(item),
                    {
                        item: ')',
                        name: ')',
                    },
                ]);
            } else {
                currentResult.push(this.createReadableRequirementsHelper(item));
            }

            if (index < requirements.items.length - 1) {
                if (requirements.type === 'and') {
                    currentResult.push({
                        item: ' and ',
                        name: ' and ',
                    });
                } else {
                    currentResult.push({
                        item: ' or ',
                        name: ' or ',
                    });
                }
            }
            return currentResult;
        });
    }

    static evaluatedRequirements(requirements) {
        const generateReducerFunction = (getAccumulatorValue) => ({
            accumulator,
            item,
            isReduced,
        }) => {
            if (isReduced) {
                return {
                    items: _.concat(accumulator.items, item),
                    type: accumulator.type,
                    value: getAccumulatorValue(accumulator.value, item.value),
                };
            }

            const wrappedItem = {
                item,
                value: false,
            };

            return {
                items: _.concat(accumulator.items, wrappedItem),
                type: accumulator.type,
                value: getAccumulatorValue(accumulator.value, wrappedItem.value),
            };
        };

        return requirements.reduce({
            andInitialValue: {
                items: [],
                type: 'and',
                value: true,
            },
            andReducer: (reducerArgs) => generateReducerFunction(
                (accumulatorValue, itemValue) => accumulatorValue && itemValue,
            )(reducerArgs),
            orInitialValue: {
                items: [],
                type: 'or',
                value: false,
            },
            orReducer: (reducerArgs) => generateReducerFunction(
                (accumulatorValue, itemValue) => accumulatorValue || itemValue,
            )(reducerArgs),
        });
    }

    static parseItemCountRequirement(requirement) {
        const itemCountRequirementMatch = requirement.match(/((?:\w|\s)+) x(\d+)/);
        if (itemCountRequirementMatch) {
            return {
                itemName: itemCountRequirementMatch[1],
                countRequired: _.toSafeInteger(itemCountRequirementMatch[2]),
            };
        }
        return null;
    }

    static prettyNameForItemRequirement(itemRequirement) {
        const itemCountRequirement = this.parseItemCountRequirement(itemRequirement);
        if (!_.isNil(itemCountRequirement)) {
            const {
                itemName,
                countRequired,
            } = itemCountRequirement;

            return this.prettyNameOverride(itemName, countRequired) || itemRequirement;
        }
        return this.prettyNameOverride(itemRequirement) || itemRequirement;
    }

    static prettyNameForItem(itemName, itemCount) {
        const prettyNameOverride = this.prettyNameOverride(itemName, itemCount);
        if (!_.isNil(prettyNameOverride)) {
            return prettyNameOverride;
        }
        return itemName;
    }

    static prettyNameOverride(itemName, itemCount = 1) {
        return _.get(prettytemNames, [itemName, itemCount]);
    }

    static checkOptionEnabledRequirement(requirement) {
        const matchers = [
            {
                regex: /^Option "([^"]+)" Enabled$/,
                value: (optionValue) => optionValue,
            },
            {
                regex: /^Option "([^"]+)" Disabled$/,
                value: (optionValue) => !optionValue,
            },
            //   {
            //     regex: /^Option "([^"]+)" Is "([^"]+)"$/,
            //     value: (optionValue, expectedValue) => optionValue === expectedValue,
            //   },
            {
                regex: /^Option "([^"]+)" Is Not "([^"]+)"$/,
                value: (optionValue, expectedValue) => optionValue !== expectedValue,
            },
            {
                regex: /^Option "([^"]+)" Contains "([^"]+)"$/,
                value: (optionValue, expectedValue) => _.get(optionValue, expectedValue),
            },
            //   {
            //     regex: /^Option "([^"]+)" Does Not Contain "([^"]+)"$/,
            //     value: (optionValue, expectedValue) => !_.get(optionValue, expectedValue),
            //   },
        ];

        let optionEnabledRequirementValue;

        _.forEach(matchers, (matcher) => {
            const requirementMatch = requirement.match(matcher.regex);
            if (requirementMatch) {
                const optionName = requirementMatch[1];
                const optionValue = this.logic.getOptionValue(optionName);
                const expectedValue = requirementMatch[2];

                optionEnabledRequirementValue = matcher.value(optionValue, expectedValue);

                return false; // break loop
            }
            return true; // continue
        });

        return optionEnabledRequirementValue;
    }
}

export default LogicHelper;
