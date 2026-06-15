/**
 * Versienummer van de online app.
 *
 * Dit wordt in de UI getoond (zie Toolbar) zodat altijd in één oogopslag
 * duidelijk is welke versie live staat.
 *
 * AFSPRAAK — verhoog dit bij ELKE wijziging die naar de live-branch
 * (`main`) gepusht en dus gepubliceerd wordt:
 *   - Kleine aanpassing / bugfix  -> verhoog de decimaal  (V10 -> V10.1 -> V10.2 …)
 *   - Grote aanpassing / feature  -> verhoog het hoofdgetal (V10.x -> V11)
 *
 * Dit is de enige plek waar het versienummer staat; pas alleen deze waarde aan.
 */
export const APP_VERSION = 'V11.1';
