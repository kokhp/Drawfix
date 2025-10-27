import { Component, computed, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';

export type SelectedParty = Record<
  string,
  {
    id: string;
    name: string;
  }[]
>;

@Component({
  selector: 'dftwa-parties',
  imports: [
    FormsModule,
    MatExpansionModule,
    MatChipsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './parties.component.html',
  styleUrl: './parties.component.scss',
})
export class PartiesComponent {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  partySettings = signal(false)
  parties = signal([
    {
      id: '1',
      name: 'Bhartiya Janta Party',
      shortName: 'BJP',
      logoUrl: '',
      stateIds: ['state id'],
      templates: [
        {
          id: 'template id',
          colors: {
            name: '#000000',
            designation: '#000000',
            socialLinks: '#000000',
            contacts: '#000000',
            phone: '#000000',
            email: '#000000',
            backgrounds: ['#000000', '#000000'],
            others: ['#000000', '#000000'],
          },
        },
      ],
    },
    {
      id: '2',
      name: 'Aam Aadmi Party',
      shortName: 'AAP',
      logoUrl: '',
      stateIds: ['state id'],
      templates: [
        {
          id: 'template id',
          colors: {
            name: '#000000',
            designation: '#000000',
            socialLinks: '#000000',
            contacts: '#000000',
            phone: '#000000',
            email: '#000000',
            backgrounds: ['#000000', '#000000'],
            others: ['#000000', '#000000'],
          },
        },
      ],
    },
    {
      id: '3',
      name: 'Congress Party',
      shortName: 'Congress',
      logoUrl: '',
      stateIds: ['state id'],
      templates: [
        {
          id: 'template id',
          colors: {
            name: '#000000',
            designation: '#000000',
            socialLinks: '#000000',
            contacts: '#000000',
            phone: '#000000',
            email: '#000000',
            backgrounds: ['#000000', '#000000'],
            others: ['#000000', '#000000'],
          },
        },
      ],
    },
  ]);

  selectedStates = signal(
    this.parties().reduce((all, party) => {
      return {
        ...all,
        [party.id]: [],
      };
    }, {} as SelectedParty)
  );

  states = signal([
    {
      id: '1',
      name: 'All',
    },
    {
      id: '2',
      name: 'Uttar Pradesh',
    },
    {
      id: '3',
      name: 'Maharastra',
    },
  ]);

  filteredStates = computed(() => {
    return this.parties().reduce((all, party) => {
      const selected = this.selectedStates()[party.id].map((s) => s.id);
      return {
        ...all,
        [party.id]: this.states().filter(
          (state) => !selected.includes(state.id)
        ),
      };
    }, {} as SelectedParty);
  });

  stateRemove(stateId: string, partyId: string): void {
    this.selectedStates.update((states) => {
      states[partyId] = states[partyId].filter((state) => state.id !== stateId);
      return { ...states };
    });
  }

  stateSelected(event: MatAutocompleteSelectedEvent, partyId: string): void {
    this.selectedStates.update((states) => {
      states[partyId].push(event.option.value)
      return { ...states };
    });
  }

  toggleSettings(event: MouseEvent, partyId: string) {
    event.stopPropagation()
    this.partySettings.set(!this.partySettings())
  }
}
